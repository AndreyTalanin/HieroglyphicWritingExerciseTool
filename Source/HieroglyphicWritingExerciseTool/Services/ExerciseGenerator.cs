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

    public async Task<HieroglyphModel[]> GenerateHieroglyphExerciseAsync(bool useKanji, bool useKanjiOnly, int size, CancellationToken cancellationToken)
    {
        HieroglyphDictionary dictionary = await DeserializeHieroglyphDictionaryAsync(cancellationToken);

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
                Type = hieroglyphType,
                Character = hieroglyph.Character,
                Pronunciation = hieroglyph.Pronunciation,
                Syllable = hieroglyph.Syllable,
                Meaning = hieroglyph.Meaning,
            };
        }

        return hieroglyphModels;
    }

    public async Task<HieroglyphWordModel[]> GenerateHieroglyphWordExerciseAsync(int size, CancellationToken cancellationToken)
    {
        HieroglyphDictionary dictionary = await DeserializeHieroglyphDictionaryAsync(cancellationToken);

        HieroglyphWordModel[] hieroglyphWordModels = new HieroglyphWordModel[size];
        for (int i = 0; i < hieroglyphWordModels.Length; i++)
        {
            HieroglyphWord hieroglyphWord = dictionary.HieroglyphWords[Random.Shared.Next(dictionary.HieroglyphWords.Length)];

            string hieroglyphWordType = hieroglyphWord.Type.ToString();
            hieroglyphWordModels[i] = new HieroglyphWordModel()
            {
                Type = hieroglyphWordType,
                Characters = hieroglyphWord.Characters,
                Pronunciation = hieroglyphWord.Pronunciation,
                Meaning = hieroglyphWord.Meaning,
            };
        }

        return hieroglyphWordModels;
    }

    private async Task<HieroglyphDictionary> DeserializeHieroglyphDictionaryAsync(CancellationToken cancellationToken)
    {
        return await Task.Run(() =>
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
    }
}
