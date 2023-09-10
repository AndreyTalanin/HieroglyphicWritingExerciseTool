import axios from "axios";
import { GenerateExerciseRequest } from "../models/GenerateExerciseRequest";
import { GenerateExerciseResponse } from "../models/GenerateExerciseResponse";

export async function generateExercise(request: GenerateExerciseRequest): Promise<GenerateExerciseResponse> {
  try {
    const { data } = await axios.post(`/api/Exercise/GenerateExercise`, request);
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
}
