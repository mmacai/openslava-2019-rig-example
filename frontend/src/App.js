import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';

import sse from './sse';
import logo from './logo.png';
import './App.css';
import { registerAsync, registerSync, ackRegistration } from './services';

const REGISTRATION_CONFIRMED = 'com.openslava.registration.confirmed';
const MENTOR_ASSIGNED = 'com.openslava.mentor.assigned';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  radio: {
    color: 'black'
  }
}));

const App = ({ enqueueSnackbar, closeSnackbar }) => {
  const classes = useStyles();
  const [values, setValues] = useState({
    name: '',
    type: 'async'
  });
  const [logs, setLogs] = useState([]);
  const [debug, setDebug] = useState(false);

  const showNotification = message => {
    const key = enqueueSnackbar(message, {
      persist: true,
      action: [
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          onClick={async () => {
            try {
              setLogs(previousLogs => [
                { type: '_notification_closed', data: message },
                ...previousLogs
              ]);

              if (message.includes('Registration confirmed!')) {
                await ackRegistration({ message, name: values.name });
              }

              closeSnackbar(key);
            } catch (error) {
              throw error;
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      ]
    });
  };

  useEffect(() => {
    sse.connect(setLogs);
  }, [enqueueSnackbar, closeSnackbar]);

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      sse.listenForMessage(MENTOR_ASSIGNED, () => {
        showNotification('Mentor assigned!');
      });
      const subscriptions = [
        {
          eventType: MENTOR_ASSIGNED,
          oneOf: [{ name: values.name }]
        }
      ];
      if (values.type === 'async') {
        sse.listenForMessage(REGISTRATION_CONFIRMED, () => {
          showNotification('Async Registration confirmed!');
        });
        subscriptions.push({
          eventType: REGISTRATION_CONFIRMED,
          oneOf: [{ name: values.name }]
        });
      }
      await sse.createSubscriptions(subscriptions);
      if (values.type === 'async') {
        await registerAsync(values);
      } else {
        const res = await registerSync(values);
        const message = await res.json();
        if (message.type === REGISTRATION_CONFIRMED) {
          setLogs(previousLogs => [
            { type: message.type, data: message },
            ...previousLogs
          ]);
          showNotification('Sync Registration confirmed!');
        }
      }

      setLogs(previousLogs => [
        { type: '_submit_success', data: values },
        ...previousLogs
      ]);
    } catch (error) {
      setLogs(previousLogs => [{ type: '_submit_error', data: error }, ...previousLogs]);
    }
  };

  return (
    <div className="App">
      <Button
        id="debug"
        type="button"
        variant="contained"
        color="secondary"
        className={classes.submit}
        onClick={() => setDebug(!debug)}
      >
        Debug
      </Button>
      <Grid container>
        <Grid item xs={debug ? 6 : 12}>
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <form
              className={classes.container}
              autoComplete="off"
              onSubmit={handleSubmit}
            >
              <TextField
                variant="outlined"
                id="name"
                label="Name"
                name="name"
                className={classes.textField}
                value={values.name}
                onChange={handleChange('name')}
                margin="normal"
                autoFocus
                fullWidth
                required
              />
              <RadioGroup
                aria-label="type"
                name="type"
                className={classes.radio}
                value={values.type}
                onChange={handleChange('type')}
              >
                <FormControlLabel value="async" control={<Radio />} label="Async" />
                <FormControlLabel value="sync" control={<Radio />} label="Sync" />
              </RadioGroup>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Register
              </Button>
            </form>
          </header>
        </Grid>
        {debug && (
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom>
              Debug logs
            </Typography>
            <List aria-label="main">
              {logs.map((log, index) => {
                const today = new Date();
                const time =
                  today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
                return (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${time} - ${log.type}`}
                      secondary={JSON.stringify(log.data)}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default withSnackbar(App);
