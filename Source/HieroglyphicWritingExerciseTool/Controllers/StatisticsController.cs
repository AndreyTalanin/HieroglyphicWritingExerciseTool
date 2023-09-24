using System.ComponentModel.DataAnnotations;
using System.Threading;
using System.Threading.Tasks;

using HieroglyphicWritingExerciseTool.Models;
using HieroglyphicWritingExerciseTool.Services;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HieroglyphicWritingExerciseTool.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
public class StatisticsController : ControllerBase
{
    private readonly StatisticsService m_statisticsService;

    public StatisticsController(StatisticsService statisticsService)
    {
        m_statisticsService = statisticsService;
    }

    [HttpPost]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ProcessExerciseStatisticsResponse>> ProcessExerciseStatisticsAsync([Required][FromBody] ProcessExerciseStatisticsRequest request, CancellationToken cancellationToken)
    {
        int exerciseSize = request.ExerciseSize;
        double totalTimeMilliseconds = request.TotalTimeMilliseconds;
        string key = request.Key;
        bool writeStatistics = request.WriteStatistics;
        ExerciseStatisticsModel model = await m_statisticsService.ProcessExerciseStatisticsAsync(exerciseSize, totalTimeMilliseconds, key, writeStatistics, cancellationToken);
        ProcessExerciseStatisticsResponse response = new()
        {
            CurrentTimeMilliseconds = model.CurrentTimeMilliseconds,
            AverageTimeMilliseconds = model.AverageTimeMilliseconds,
            MinTimeMilliseconds = model.MinTimeMilliseconds,
            MaxTimeMilliseconds = model.MaxTimeMilliseconds,
        };
        return Ok(response);
    }
}
