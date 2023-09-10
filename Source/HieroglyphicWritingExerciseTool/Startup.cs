using HieroglyphicWritingExerciseTool.Configuration;
using HieroglyphicWritingExerciseTool.Services;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace HieroglyphicWritingExerciseTool;

public class Startup
{
    private const string c_clientApplicationPath = "ClientApplication";

    private readonly IConfiguration m_configuration;

    public Startup(IConfiguration configuration)
    {
        m_configuration = configuration;
    }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();

        services.AddEndpointsApiExplorer();

        services.AddSwaggerGen();

        services.AddSpaStaticFiles(staticFilesOptions =>
        {
            staticFilesOptions.RootPath = $"{c_clientApplicationPath}/build";
        });

        services.Configure<ExerciseGeneratorConfiguration>(m_configuration.GetSection("ExerciseGenerator"));

        services.AddTransient<ExerciseGenerator>();
    }

    public void Configure(IApplicationBuilder applicationBuilder, IWebHostEnvironment webHostEnvironment)
    {
        if (webHostEnvironment.IsDevelopment())
        {
            applicationBuilder.UseSwagger();
            applicationBuilder.UseSwaggerUI();

            applicationBuilder.UseDeveloperExceptionPage();
        }
        else
        {
            applicationBuilder.UseHsts();
        }

        applicationBuilder.UseHttpsRedirection();

        applicationBuilder.UseStaticFiles();
        applicationBuilder.UseSpaStaticFiles();

        applicationBuilder.UseRouting();

        applicationBuilder.UseAuthorization();

        applicationBuilder.UseEndpoints(endpointRouteBuilder =>
        {
            endpointRouteBuilder.MapControllers();
        });

        applicationBuilder.UseSpa(spaBuilder =>
        {
            spaBuilder.Options.SourcePath = c_clientApplicationPath;
            if (webHostEnvironment.IsDevelopment())
            {
                spaBuilder.UseReactDevelopmentServer(npmScript: "start");
            }
        });
    }
}
