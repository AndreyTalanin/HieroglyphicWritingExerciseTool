import axios from "axios";
import { GenerateHieroglyphExerciseRequest } from "../models/GenerateHieroglyphExerciseRequest";
import { GenerateHieroglyphExerciseResponse } from "../models/GenerateHieroglyphExerciseResponse";
import { GenerateHieroglyphWordExerciseRequest } from "../models/GenerateHieroglyphWordExerciseRequest";
import { GenerateHieroglyphWordExerciseResponse } from "../models/GenerateHieroglyphWordExerciseResponse";

export async function generateHieroglyphExercise(request: GenerateHieroglyphExerciseRequest): Promise<GenerateHieroglyphExerciseResponse> {
  try {
    const { data } = await axios.post(`/api/Exercise/GenerateHieroglyphExercise`, request);
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function generateHieroglyphWordExercise(request: GenerateHieroglyphWordExerciseRequest): Promise<GenerateHieroglyphWordExerciseResponse> {
  try {
    const { data } = await axios.post(`/api/Exercise/GenerateHieroglyphWordExercise`, request);
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
}
