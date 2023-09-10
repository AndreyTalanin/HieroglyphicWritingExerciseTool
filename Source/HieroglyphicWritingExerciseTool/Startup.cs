using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace HieroglyphicWritingExerciseTool;

public class Startup
{
    public Startup()
    {
    }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();

        services.AddEndpointsApiExplorer();

        services.AddSwaggerGen();
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

        applicationBuilder.UseRouting();

        applicationBuilder.UseAuthorization();

        applicationBuilder.UseEndpoints(endpointRouteBuilder =>
        {
            endpointRouteBuilder.MapControllers();
        });
    }
}
