using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using System.Xml.Serialization;

using HieroglyphicWritingExerciseTool.Configuration;
using HieroglyphicWritingExerciseTool.Entities;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HieroglyphicWritingExerciseTool.Data;

public class StatisticsRepository
{
    private readonly StatisticsStorageConfiguration m_configuration;
    private readonly ILogger<StatisticsRepository> m_logger;

    public StatisticsRepository(IOptions<StatisticsStorageConfiguration> options, ILogger<StatisticsRepository> logger)
    {
        m_configuration = options.Value;
        m_logger = logger;
    }

    public async Task<StatisticsStorage> ReadStatisticsAsync(CancellationToken cancellationToken)
    {
        return await Task.Run(() =>
        {
            StatisticsStorage? storage;
            using (StreamReader streamReader = new(m_configuration.StatisticsStorageFileName))
            {
                XmlSerializer xmlSerializer = new(typeof(StatisticsStorage));
                storage = (StatisticsStorage?)xmlSerializer.Deserialize(streamReader);
            }
            return storage is null
                ? throw new InvalidOperationException($"Can not deserialize the '{m_configuration.StatisticsStorageFileName}' storage.")
                : storage;
        }, cancellationToken);
    }

    public async Task<bool> WriteStatisticsAsync(StatisticsStorage storage, CancellationToken cancellationToken)
    {
        return await Task.Run(() =>
        {
            try
            {
                using StreamWriter streamWriter = new(m_configuration.StatisticsStorageFileName);
                XmlSerializer xmlSerializer = new(typeof(StatisticsStorage));
                xmlSerializer.Serialize(streamWriter, storage);
                streamWriter.WriteLine();
                return true;
            }
            catch (IOException exception)
            {
                m_logger.LogWarning(exception, "Can not rewrite the '{StatisticsStorageFileName}' storage.", m_configuration.StatisticsStorageFileName);
                return false;
            }
        }, cancellationToken);
    }
}
