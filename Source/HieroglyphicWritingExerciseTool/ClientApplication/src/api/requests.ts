import axios from "axios";
import { GenerateHieroglyphExerciseRequest } from "../models/GenerateHieroglyphExerciseRequest";
import { GenerateHieroglyphExerciseResponse } from "../models/GenerateHieroglyphExerciseResponse";
import { GenerateHieroglyphWordExerciseRequest } from "../models/GenerateHieroglyphWordExerciseRequest";
import { GenerateHieroglyphWordExerciseResponse } from "../models/GenerateHieroglyphWordExerciseResponse";
import { ProcessExerciseStatisticsRequest } from "../models/ProcessExerciseStatisticsRequest";
import { ProcessExerciseStatisticsResponse } from "../models/ProcessExerciseStatisticsResponse";

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

export async function processExerciseStatistics(request: ProcessExerciseStatisticsRequest): Promise<ProcessExerciseStatisticsResponse> {
  try {
    const { data } = await axios.post(`/api/Statistics/ProcessExerciseStatistics`, request);
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
}
