import { SELECT_STUDY_SORTING_RESULT } from "../actions/actionCreators";
import { initialState } from "./initialState";

const selectedStudySortingResult = (state = initialState, action) => {
  switch (action.type) {
    case SELECT_STUDY_SORTING_RESULT:
      return action.study_sorting_result;
    default:
      return state;
  }
};

export default selectedStudySortingResult;