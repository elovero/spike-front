import { RECEIVE_STUDIES } from "../actions/actionCreators";

const initialState = {
  selectedRecording: null,
  selectedStudy: null,
  recordings: null,
  sorters: null,
  units: null,
  pairing: null,
  recordingDetails: null,
  //V2 Data: States
  contactSent: null,
  cpus: null,
  studies: null,
  loading: null
};

const studies = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_STUDIES:
      return action.studies;
    default:
      return state;
  }
};

export default studies;
