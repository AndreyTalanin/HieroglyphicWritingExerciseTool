using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Xml.Serialization;

using HieroglyphicWritingExerciseTool.Configuration;
using HieroglyphicWritingExerciseTool.Entities;
using HieroglyphicWritingExerciseTool.Models;

using Microsoft.Extensions.Options;

namespace HieroglyphicWritingExerciseTool.Services;

public class ExerciseGenerator
{
    private readonly ExerciseGeneratorConfiguration m_configuration;

    public ExerciseGenerator(IOptions<ExerciseGeneratorConfiguration> options)
    {
        m_configuration = options.Value;
    }

    public async Task<HieroglyphModel[]> GenerateExerciseAsync(bool useKanji, bool useKanjiOnly, int size, CancellationToken cancellationToken)
    {
        HieroglyphDictionary dictionary = await Task.Run(() =>
        {
            HieroglyphDictionary? dictionary;
            using (StreamReader streamReader = new(m_configuration.HieroglyphDictionaryFileName))
            {
                XmlSerializer xmlSerializer = new(typeof(HieroglyphDictionary));
                dictionary = (HieroglyphDictionary?)xmlSerializer.Deserialize(streamReader);
            }
            return dictionary is null
                ? throw new InvalidOperationException($"Can not deserialize the '{m_configuration.HieroglyphDictionaryFileName}' dictionary.")
                : dictionary;
        }, cancellationToken);

        Hieroglyph[] hieroglyphsByConfig = dictionary.Hieroglyphs
            .Where(hieroglyph => !useKanjiOnly || hieroglyph.Type == HieroglyphType.Kanji)
            .Where(hieroglyph => useKanji || hieroglyph.Type != HieroglyphType.Kanji)
            .ToArray();

        HieroglyphModel[] hieroglyphModels = new HieroglyphModel[size];
        for (int i = 0; i < hieroglyphModels.Length; i++)
        {
            Hieroglyph hieroglyph = hieroglyphsByConfig[Random.Shared.Next(hieroglyphsByConfig.Length)];

            string hieroglyphType = hieroglyph.Type.ToString();
            hieroglyphModels[i] = new HieroglyphModel()
            {
                Character = hieroglyph.Character,
                Type = hieroglyphType,
                Pronunciation = hieroglyph.Pronunciation,
                Syllable = hieroglyph.Syllable,
                Meaning = hieroglyph.Meaning,
            };
        }

        return hieroglyphModels;
    }
}
