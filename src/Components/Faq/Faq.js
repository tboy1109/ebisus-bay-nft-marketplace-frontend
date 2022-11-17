import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSelector } from 'react-redux';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '92%',
    margin: '50px auto',
    marginBottom: '50px',
  },
  heading: {
    fontSize: theme.typography.pxToRem(16),
    fontWeight: theme.typography.fontWeightBold,
  },
  text: {
    fontSize: '1.1rem',
    fontWeight: '500',
  },
  border: {
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));

const Accordion = withStyles({
  root: {
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
    margin: '15px 0px',
  },

  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles({
  root: {
    backgroundColor: 'transparent',
    borderRadius: '10px',
    marginBottom: -1,
    minHeight: 56,
    boxShadow: '0px 3px 6px rgba(0, 0, 0, .125) ',
    '&$expanded': {
      minHeight: 56,
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiAccordionDetails);
export default function SimpleAccordion() {
  const classes = useStyles();
  const faqSelector = useSelector((state) => {
    return state.initState.faq;
  });

  return (
    <Container maxWidth="md">
      {faqSelector.map((val, j) => {
        return (
          <Accordion square TransitionProps={{ unmountOnExit: true, timeout: 400 }} key={j}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon color="primary" />}
              aria-controls={val.tab}
              id={val.id}
              className={classes.border}
            >
              <Typography className={classes.heading} color="primary">
                {val.head}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography className={`${classes.text}  faqText`} color="primary">
                {val.desc}
              </Typography>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Container>
  );
}
