using System.Data.Odbc;
using System.Net.Http;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

Console.WriteLine($"Architecture: {(Environment.Is64BitProcess ? "64-bit" : "32-bit")}");
string odbcConnectionString = "DSN=OrclAguai_ODBC_x86;Uid=admin;Pwd=Passw0rd;";

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");


app.MapPost("/py/send", async () =>
{
    try
    {
        var client = new HttpClient();
        var payload = new
        {
            message = "Hola desde .NET",
            value = 42
        };
        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await client.PostAsync("http://127.0.0.1:8000/receive", content);
        var result = await response.Content.ReadAsStringAsync();
        Console.WriteLine(result);
        return Results.Ok("✅ Message sent to Python service.");
    }
    catch (Exception ex)
    {
        return Results.Problem($"❌ Send py failed: {ex.Message}");
    }
});




app.MapPost("/py/receive", (Payload payload) =>
{
    try
    {
        Console.WriteLine($"Mensaje: {payload.Message}, Valor: {payload.Value}");
        return Results.Ok(new { status = "recibido", echo = payload });
    }
    catch (Exception ex)
    {
        return Results.Problem($"❌ Connection failed: {ex.Message}");
    }
});

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

// dotnet build -c Release -p:PlatformTarget=x86
// dotnet run