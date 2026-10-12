<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Mail\ResetPasswordCodeMail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_code_can_be_requested(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $response = $this->postJson('/api/password/forgot', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['message']);

        // Assert code is stored in DB
        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'test@example.com',
        ]);

        // Assert mail was sent
        Mail::assertSent(ResetPasswordCodeMail::class, function ($mail) {
            return $mail->hasTo('test@example.com') && !empty($mail->code);
        });
    }

    public function test_reset_code_request_fails_if_email_does_not_exist(): void
    {
        $response = $this->postJson('/api/password/forgot', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(422); // Validation error
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_password_can_be_reset_with_valid_code(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('old-password'),
        ]);

        // Put a token (hash of code '123456') in DB
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make('123456'),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/password/reset', [
            'email' => 'test@example.com',
            'token' => '123456',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Your password has been reset successfully.']);

        // Assert user's password was updated
        $user->refresh();
        $this->assertTrue(Hash::check('new-password', $user->password));

        // Assert token is deleted
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'test@example.com',
        ]);
    }

    public function test_password_reset_fails_with_invalid_code(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make('123456'),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/password/reset', [
            'email' => 'test@example.com',
            'token' => 'wrong-code',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertStatus(400);
        $response->assertJson(['message' => 'Invalid reset code.']);
    }

    public function test_password_reset_fails_if_expired(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make('123456'),
            'created_at' => now()->subHours(2), // expired (limit is 1 hour)
        ]);

        $response = $this->postJson('/api/password/reset', [
            'email' => 'test@example.com',
            'token' => '123456',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertStatus(400);
        $response->assertJson(['message' => 'Reset code has expired. Please request a new one.']);
    }
}
