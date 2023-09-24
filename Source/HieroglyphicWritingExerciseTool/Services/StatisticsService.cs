using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using HieroglyphicWritingExerciseTool.Data;
using HieroglyphicWritingExerciseTool.Entities;
using HieroglyphicWritingExerciseTool.Models;

namespace HieroglyphicWritingExerciseTool.Services;

public class StatisticsService
{
    private readonly StatisticsRepository m_statisticsRepository;

    public StatisticsService(StatisticsRepository statisticsRepository)
    {
        m_statisticsRepository = statisticsRepository;
    }

    public async Task<ExerciseStatisticsModel> ProcessExerciseStatisticsAsync(int exerciseSize, double totalTimeMilliseconds, string key, bool writeStatistics, CancellationToken cancellationToken)
    {
        double timeMilliseconds = totalTimeMilliseconds / exerciseSize;
        StatisticsStorage storage = await m_statisticsRepository.ReadStatisticsAsync(cancellationToken);
        StatisticsSection? section = storage.StatisticsSections.FirstOrDefault(section => section.Key == key);
        if (section is null)
        {
            section = new StatisticsSection()
            {
                Key = key,
                ExercisesCount = 0,
                AverageTimeMilliseconds = 0,
                MinTimeMilliseconds = TimeSpan.TicksPerHour / TimeSpan.TicksPerMillisecond,
                MaxTimeMilliseconds = 0,
            };
            storage.StatisticsSections = storage.StatisticsSections.Concat(Enumerable.Repeat(section, 1)).ToArray();
        }

        ExerciseStatisticsModel model = new()
        {
            CurrentTimeMilliseconds = timeMilliseconds,
            AverageTimeMilliseconds = section.AverageTimeMilliseconds,
            MinTimeMilliseconds = section.MinTimeMilliseconds,
            MaxTimeMilliseconds = section.MaxTimeMilliseconds,
        };

        if (writeStatistics)
        {
            section.ExercisesCount++;
            section.AverageTimeMilliseconds =
                (timeMilliseconds + (section.AverageTimeMilliseconds * (section.ExercisesCount - 1)))
                / section.ExercisesCount;
            section.MinTimeMilliseconds = Math.Min(timeMilliseconds, section.MinTimeMilliseconds);
            section.MaxTimeMilliseconds = Math.Max(timeMilliseconds, section.MaxTimeMilliseconds);

            bool saved = false;
            for (int retryIndex = 0; !saved && retryIndex < 5; retryIndex++)
                saved |= await m_statisticsRepository.WriteStatisticsAsync(storage, cancellationToken);

            if (!saved)
                throw new InvalidOperationException("Can not save the statistics.");
        }

        return model;
    }
}
