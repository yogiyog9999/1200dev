import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

// Import all your reusable components
import { GlobalHeaderComponent } from '../components/global-header/global-header.component';

@NgModule({
  declarations: [
    GlobalHeaderComponent   // ✅ declare here
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [
    GlobalHeaderComponent,  // ✅ export so other modules can use it
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class SharedModule {}
