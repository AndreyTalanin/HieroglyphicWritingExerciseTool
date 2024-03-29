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
public class ExerciseController : ControllerBase
{
    private readonly ExerciseGenerator m_exerciseGenerator;

    public ExerciseController(ExerciseGenerator exerciseGenerator)
    {
        m_exerciseGenerator = exerciseGenerator;
    }

    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public ActionResult<int> GetDefaultExerciseSize()
    {
        int defaultExerciseSize = m_exerciseGenerator.GetDefaultExerciseSize();
        GetDefaultExerciseSizeResponse response = new() { DefaultExerciseSize = defaultExerciseSize };
        return Ok(response);
    }

    [HttpPost]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<GenerateHieroglyphExerciseResponse>> GenerateHieroglyphExerciseAsync([Required][FromBody] GenerateHieroglyphExerciseRequest request, CancellationToken cancellationToken)
    {
        bool useKanji = request.UseKanji;
        bool useKanjiOnly = request.UseKanjiOnly;
        int size = request.Size;

        useKanji |= useKanjiOnly;
        HieroglyphModel[] hieroglyphs = await m_exerciseGenerator.GenerateHieroglyphExerciseAsync(useKanji, useKanjiOnly, size, cancellationToken);
        GenerateHieroglyphExerciseResponse response = new()
        {
            UseKanjiColumns = useKanji,
            UseKanjiColumnsOnly = useKanjiOnly,
            Hieroglyphs = hieroglyphs
        };

        return Ok(response);
    }

    [HttpPost]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<GenerateHieroglyphWordExerciseResponse>> GenerateHieroglyphWordExerciseAsync([Required][FromBody] GenerateHieroglyphWordExerciseRequest request, CancellationToken cancellationToken)
    {
        int size = request.Size;
        HieroglyphWordModel[] hieroglyphWords = await m_exerciseGenerator.GenerateHieroglyphWordExerciseAsync(size, cancellationToken);
        GenerateHieroglyphWordExerciseResponse response = new() { HieroglyphWords = hieroglyphWords };
        return Ok(response);
    }
}
