using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql;
using OmegaERP.Api.Data;
using System.Text;

namespace OmegaERP.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // JWT ayarlarý
            var jwtKey = builder.Configuration["Jwt:Key"];
            var jwtIssuer = builder.Configuration["Jwt:Issuer"];
            var jwtAudience = builder.Configuration["Jwt:Audience"];

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme =
                    JwtBearerDefaults.AuthenticationScheme;

                options.DefaultChallengeScheme =
                    JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters =
                    new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,

                        ValidIssuer = jwtIssuer,
                        ValidAudience = jwtAudience,

                        IssuerSigningKey =
                            new SymmetricSecurityKey(
                                Encoding.UTF8.GetBytes(jwtKey!)
                            )
                    };
            });

            builder.Services.AddAuthorization();

            // ---------------------------------------------------------
            // CORS
            // ---------------------------------------------------------
            // Localhost ve Vercel dahil frontend isteklerine izin veriyoruz.
            // Canlý baðlantýyý test ettikten sonra istersek
            // sadece belirli domainlere izin verecek þekilde daraltabiliriz.
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("FrontendPolicy", policy =>
                {
                    policy
                        .AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            });

            // ---------------------------------------------------------
            // PostgreSQL baðlantýsý
            // ---------------------------------------------------------

            string? connectionString;

            // Railway'de tanýmlanan DATABASE_URL
            var databaseUrl =
                Environment.GetEnvironmentVariable("DATABASE_URL");

            if (!string.IsNullOrWhiteSpace(databaseUrl))
            {
                // Railway DATABASE_URL:
                // postgresql://user:password@host:port/database

                var databaseUri = new Uri(databaseUrl);

                var userInfo = databaseUri.UserInfo.Split(
                    ':',
                    2,
                    StringSplitOptions.None
                );

                var username =
                    Uri.UnescapeDataString(userInfo[0]);

                var password =
                    userInfo.Length > 1
                        ? Uri.UnescapeDataString(userInfo[1])
                        : "";

                var database =
                    databaseUri.AbsolutePath.TrimStart('/');

                var connectionBuilder =
                    new NpgsqlConnectionStringBuilder
                    {
                        Host = databaseUri.Host,
                        Port = databaseUri.Port,
                        Username = username,
                        Password = password,
                        Database = database,
                        SslMode = SslMode.Prefer
                    };

                connectionString =
                    connectionBuilder.ConnectionString;
            }
            else
            {
                // Local çalýþtýrmada appsettings.json veya
                // appsettings.Development.json kullanýlýr.
                connectionString =
                    builder.Configuration.GetConnectionString(
                        "DefaultConnection"
                    );
            }

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException(
                    "PostgreSQL baðlantý bilgisi bulunamadý."
                );
            }

            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(connectionString)
            );

            builder.Services.AddControllers();

            builder.Services.AddEndpointsApiExplorer();

            // ---------------------------------------------------------
            // Swagger
            // ---------------------------------------------------------

            builder.Services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition(
                    "Bearer",
                    new OpenApiSecurityScheme
                    {
                        Name = "Authorization",
                        Type = SecuritySchemeType.Http,
                        Scheme = "bearer",
                        BearerFormat = "JWT",
                        In = ParameterLocation.Header,
                        Description = "JWT token giriniz."
                    }
                );

                options.AddSecurityRequirement(
                    new OpenApiSecurityRequirement
                    {
                        {
                            new OpenApiSecurityScheme
                            {
                                Reference = new OpenApiReference
                                {
                                    Type = ReferenceType.SecurityScheme,
                                    Id = "Bearer"
                                }
                            },
                            Array.Empty<string>()
                        }
                    }
                );
            });

            var app = builder.Build();

            // ---------------------------------------------------------
            // Migration
            // ---------------------------------------------------------
            // Railway baþladýðýnda bekleyen migration'larý PostgreSQL'e uygular.

            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider
                    .GetRequiredService<AppDbContext>();

                db.Database.Migrate();
            }

            // ---------------------------------------------------------
            // Middleware
            // ---------------------------------------------------------

            // Swagger canlý ortamda da açýk.
            app.UseSwagger();
            app.UseSwaggerUI();

            app.UseHttpsRedirection();

            // CORS authentication'dan önce çalýþmalý.
            app.UseCors("FrontendPolicy");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}