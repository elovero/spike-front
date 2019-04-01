import { RECEIVE_PAIRING } from "../actions/actionCreators";

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

const pairing = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_PAIRING:
      return action.pairing;
    default:
      return state;
  }
};

export default pairing;
