import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { JsonParsePipe } from './pipes/json-parse-pipe';

//import { ComponentsModule } from './components/global-header/global-header.module';
@NgModule({
  declarations: [
    AppComponent // ✅ Declare here, not in imports
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(), // ✅ Ionic module initialization
    AppRoutingModule,
    HttpClientModule,JsonParsePipe
	//ComponentsModule   
  ],
  providers: [],
  bootstrap: [AppComponent], // ✅ Bootstrap your root component
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // ✅ Allow Ionic custom elements
})
export class AppModule {}
