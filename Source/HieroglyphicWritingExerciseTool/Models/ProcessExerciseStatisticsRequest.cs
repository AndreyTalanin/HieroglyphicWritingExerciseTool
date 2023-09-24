namespace HieroglyphicWritingExerciseTool.Models;

public class ProcessExerciseStatisticsRequest
{
    public int ExerciseSize { get; set; }

    public double TotalTimeMilliseconds { get; set; }

    public string Key { get; set; } = string.Empty;

    public bool WriteStatistics { get; set; }
}
