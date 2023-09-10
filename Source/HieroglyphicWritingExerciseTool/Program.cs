using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace HieroglyphicWritingExerciseTool;

public class Program
{
    public static void Main(string[] args)
    {
        CreateHostBuilder(args)
            .Build()
            .Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args)
    {
        IHostBuilder hostBuilder = Host.CreateDefaultBuilder(args);
        hostBuilder.ConfigureWebHostDefaults(webHostBuilder =>
        {
            webHostBuilder.UseStartup<Startup>();
        });

        return hostBuilder;
    }
}
