import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController,NavController } from '@ionic/angular';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
  standalone: false,
})
export class HelpPage {
  subject = '';
  message = '';
   email = '';
  name = '';
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient, private toastCtrl: ToastController, private navCtrl: NavController,) {}

  async sendHelpEmail() {
    if (!this.subject || !this.message || !this.name || !this.email) {
      this.showToast('Please fill in all fields.', 'warning');
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      subject: this.subject,
      message: this.message,
	  name: this.name,
      email: this.email,
      
    };

    this.http.post('https://dlistapp.net/api/send-help.php', payload).subscribe({
      next: async (res: any) => {
        this.loading = false;

        if (res.success) {
          this.successMessage = '✅ Message sent successfully!';
          this.errorMessage = '';
          this.subject = '';
          this.message = '';
          this.showToast(this.successMessage, 'success');
        } else {
          this.errorMessage = '❌ Failed to send message.';
          this.successMessage = '';
          this.showToast(this.errorMessage, 'danger');
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = '❌ Something went wrong.';
        this.successMessage = '';
        console.error(err);
        this.showToast(this.errorMessage, 'danger');
      },
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 2000,
      position: 'top',
    });
    toast.present();
  }
  goBack() {
  this.navCtrl.back(); // goes to previous page dynamically
}
}
