<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminApprovalRequired extends Notification
{
    use Queueable;

    /**
     * The newly registered user that requires admin approval.
     */
    public function __construct(
        public User $user
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * Supports both mail and database channels so that admins
     * receive an email and also see the notification in-app.
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $adminName = $notifiable->first_name
            ? $notifiable->first_name . ' ' . ($notifiable->last_name ?? '')
            : ($notifiable->name ?? 'Admin');

        return (new MailMessage)
            ->subject('New User Registration Requires Your Approval')
            ->greeting('Hello ' . trim($adminName) . ',')
            ->line('A new user has registered on the platform and requires your approval before they can log in.')
            ->line('**Name:** ' . $this->user->name)
            ->line('**Email:** ' . $this->user->email)
            ->line('**Role:** ' . ucfirst($this->user->role))
            ->action('Review Pending Users', url('/users'))
            ->line('Thank you for using PharmaSys!');
    }

    /**
     * Get the array representation of the notification for the database channel.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'user_id' => $this->user->id,
            'name'    => $this->user->name,
            'email'   => $this->user->email,
            'role'    => $this->user->role,
            'message' => "New user {$this->user->name} ({$this->user->email}) has registered and requires admin approval.",
        ];
    }
}
