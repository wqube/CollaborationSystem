using CollaborationSystem.Application.DTOs.Auth;
using CollaborationSystem.Application.DTOs.Projects;
using CollaborationSystem.Application.DTOs.Suggestions;
using FluentValidation;

namespace CollaborationSystem.Tests.Validation;

public sealed class RequestValidatorTests
{
    [Fact]
    public void LoginRequestValidator_accepts_valid_credentials()
    {
        var validator = new LoginRequestValidator();

        var result = validator.Validate(new LoginRequest
        {
            Email = "user@example.com",
            Password = "StrongPassword123"
        });

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("", "password")]
    [InlineData("not-an-email", "password")]
    [InlineData("user@example.com", "")]
    public void LoginRequestValidator_rejects_invalid_credentials(string email, string password)
    {
        var validator = new LoginRequestValidator();

        var result = validator.Validate(new LoginRequest
        {
            Email = email,
            Password = password
        });

        Assert.False(result.IsValid);
    }

    [Fact]
    public void LoginRequestValidator_rejects_values_over_max_lengths()
    {
        var validator = new LoginRequestValidator();

        var result = validator.Validate(new LoginRequest
        {
            Email = $"{new string('a', 250)}@example.com",
            Password = new string('p', 129)
        });

        Assert.False(result.IsValid);
    }

    [Fact]
    public void CreateSuggestionRequestValidator_accepts_valid_text()
    {
        var validator = new CreateSuggestionRequestValidator();

        var result = validator.Validate(new CreateSuggestionRequest
        {
            Text = "Add dark mode"
        });

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("")]
    public void CreateSuggestionRequestValidator_rejects_empty_text(string text)
    {
        var validator = new CreateSuggestionRequestValidator();

        var result = validator.Validate(new CreateSuggestionRequest
        {
            Text = text
        });

        Assert.False(result.IsValid);
    }

    [Fact]
    public void CreateSuggestionRequestValidator_rejects_text_over_max_length()
    {
        var validator = new CreateSuggestionRequestValidator();

        var result = validator.Validate(new CreateSuggestionRequest
        {
            Text = new string('s', 4001)
        });

        Assert.False(result.IsValid);
    }

    [Fact]
    public void CreateCommentRequestValidator_accepts_valid_text_with_parent()
    {
        var validator = new CreateCommentRequestValidator();

        var result = validator.Validate(new CreateCommentRequest
        {
            Text = "Looks good",
            ParentCommentId = Guid.NewGuid()
        });

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("")]
    public void CreateCommentRequestValidator_rejects_empty_text(string text)
    {
        var validator = new CreateCommentRequestValidator();

        var result = validator.Validate(new CreateCommentRequest
        {
            Text = text
        });

        Assert.False(result.IsValid);
    }

    [Fact]
    public void CreateCommentRequestValidator_rejects_text_over_max_length()
    {
        var validator = new CreateCommentRequestValidator();

        var result = validator.Validate(new CreateCommentRequest
        {
            Text = new string('c', 4001)
        });

        Assert.False(result.IsValid);
    }

    [Fact]
    public void CreateProjectRequestValidator_accepts_valid_project()
    {
        var validator = new CreateProjectRequestValidator();

        var result = validator.Validate(new CreateProjectRequest
        {
            Name = "Roadmap",
            Description = "Product planning"
        });

        Assert.True(result.IsValid);
    }

    [Fact]
    public void CreateProjectRequestValidator_rejects_empty_name()
    {
        var validator = new CreateProjectRequestValidator();

        var result = validator.Validate(new CreateProjectRequest
        {
            Name = "",
            Description = "Product planning"
        });

        Assert.False(result.IsValid);
    }

    [Fact]
    public void CreateProjectRequestValidator_rejects_values_over_max_lengths()
    {
        var validator = new CreateProjectRequestValidator();

        var result = validator.Validate(new CreateProjectRequest
        {
            Name = new string('p', 201),
            Description = new string('d', 2001)
        });

        Assert.False(result.IsValid);
    }
}
