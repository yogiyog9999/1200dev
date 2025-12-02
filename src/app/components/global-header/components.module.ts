import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GlobalHeaderComponent } from './global-header/global-header.component';

@NgModule({
  declarations: [GlobalHeaderComponent],
  imports: [CommonModule, IonicModule],
  exports: [GlobalHeaderComponent] // 👈 makes it available globally
})
export class ComponentsModule {}
