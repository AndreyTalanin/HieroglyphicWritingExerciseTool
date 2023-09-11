import axios from "axios";
import { GenerateHieroglyphExerciseRequest } from "../models/GenerateHieroglyphExerciseRequest";
import { GenerateHieroglyphExerciseResponse } from "../models/GenerateHieroglyphExerciseResponse";

export async function generateHieroglyphExercise(request: GenerateHieroglyphExerciseRequest): Promise<GenerateHieroglyphExerciseResponse> {
  try {
    const { data } = await axios.post(`/api/Exercise/GenerateHieroglyphExercise`, request);
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
}
