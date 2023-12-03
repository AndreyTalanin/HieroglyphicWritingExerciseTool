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

    public int GetDefaultExerciseSize()
    {
        return m_configuration.DefaultExerciseSize;
    }

    public async Task<HieroglyphModel[]> GenerateHieroglyphExerciseAsync(bool useKanji, bool useKanjiOnly, int size, CancellationToken cancellationToken)
    {
        HieroglyphDictionary dictionary = await DeserializeHieroglyphDictionaryAsync(cancellationToken);

        Hieroglyph[] hieroglyphsByConfig = dictionary.Hieroglyphs
            .Concat(dictionary.HieroglyphGroups
                .Where(hieroglyphGroup => hieroglyphGroup.Enabled)
                .SelectMany(hieroglyphGroup => hieroglyphGroup.Hieroglyphs))
            .Where(hieroglyph => !useKanjiOnly || hieroglyph.Type == HieroglyphType.Kanji)
            .Where(hieroglyph => useKanji || hieroglyph.Type != HieroglyphType.Kanji)
            .ToArray();

        int hieroglyphsDistributed = 0;
        HieroglyphModel[] hieroglyphModels = new HieroglyphModel[size];
        foreach ((string tag, int tagDistribution) in m_configuration.TagsDistribution)
        {
            Hieroglyph[] hieroglyphsByTag = hieroglyphsByConfig
                .Where(hieroglyph => hieroglyph.GetTags().Contains(tag, StringComparer.InvariantCultureIgnoreCase))
                .ToArray();

            for (int i = 0; i < tagDistribution && hieroglyphsDistributed < size && hieroglyphsByTag.Length > 0; i++)
            {
                Hieroglyph hieroglyph = hieroglyphsByTag[Random.Shared.Next(hieroglyphsByTag.Length)];

                string hieroglyphType = hieroglyph.Type.ToString();
                hieroglyphModels[hieroglyphsDistributed++] = new HieroglyphModel()
                {
                    Type = hieroglyphType,
                    Character = hieroglyph.Character,
                    Pronunciation = hieroglyph.Pronunciation,
                    Syllable = hieroglyph.Syllable,
                    Meaning = hieroglyph.Meaning,
                };
            }
        }

        if (hieroglyphsDistributed < size)
        {
            Hieroglyph[] hieroglyphsWithoutTags = hieroglyphsByConfig
                .Where(hieroglyph => hieroglyph.GetTags().Length == 0)
                .ToArray();

            while (hieroglyphsDistributed < size && hieroglyphsWithoutTags.Length > 0)
            {
                Hieroglyph hieroglyph = hieroglyphsWithoutTags[Random.Shared.Next(hieroglyphsWithoutTags.Length)];

                string hieroglyphType = hieroglyph.Type.ToString();
                hieroglyphModels[hieroglyphsDistributed++] = new HieroglyphModel()
                {
                    Type = hieroglyphType,
                    Character = hieroglyph.Character,
                    Pronunciation = hieroglyph.Pronunciation,
                    Syllable = hieroglyph.Syllable,
                    Meaning = hieroglyph.Meaning,
                };
            }
        }

        for (int i = 0; i < hieroglyphModels.Length; i++)
        {
            int j = Random.Shared.Next(hieroglyphModels.Length);
            (hieroglyphModels[i], hieroglyphModels[j]) = (hieroglyphModels[j], hieroglyphModels[i]);
        }

        return hieroglyphModels;
    }

    public async Task<HieroglyphWordModel[]> GenerateHieroglyphWordExerciseAsync(int size, CancellationToken cancellationToken)
    {
        HieroglyphDictionary dictionary = await DeserializeHieroglyphDictionaryAsync(cancellationToken);

        HieroglyphWord[] hieroglyphWordsByConfig = dictionary.HieroglyphWords
            .Concat(dictionary.HieroglyphWordGroups
                .Where(hieroglyphWordGroup => hieroglyphWordGroup.Enabled)
                .SelectMany(hieroglyphWordGroup => hieroglyphWordGroup.HieroglyphWords))
            .ToArray();

        HieroglyphWordModel[] hieroglyphWordModels = new HieroglyphWordModel[size];
        for (int i = 0; i < hieroglyphWordModels.Length; i++)
        {
            HieroglyphWord hieroglyphWord = hieroglyphWordsByConfig[Random.Shared.Next(hieroglyphWordsByConfig.Length)];

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
