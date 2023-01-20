import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MdbAccordionModule } from 'mdb-angular-ui-kit/accordion';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { MdbCheckboxModule } from 'mdb-angular-ui-kit/checkbox';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { MdbModalModule } from 'mdb-angular-ui-kit/modal';
import { MdbPopoverModule } from 'mdb-angular-ui-kit/popover';
import { MdbRadioModule } from 'mdb-angular-ui-kit/radio';
import { MdbRangeModule } from 'mdb-angular-ui-kit/range';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';
import { MdbScrollspyModule } from 'mdb-angular-ui-kit/scrollspy';
import { MdbTabsModule } from 'mdb-angular-ui-kit/tabs';
import { MdbTooltipModule } from 'mdb-angular-ui-kit/tooltip';
import { MdbValidationModule } from 'mdb-angular-ui-kit/validation';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NotaComponent } from './components/nota/nota.component';
import { AlertComponent } from './components/alert/alert.component';
import { AlertModule, AvatarModule } from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { HttpClientModule } from '@angular/common/http';
import { LoaderDataService } from './services/loader-data.service';
import { SpinnerModule } from '@coreui/angular';
import { LoaderCasoComponent } from './components/loader-caso/loader-caso.component';
import { FooterComponent } from './components/footer/footer.component';
import { AboutComponent } from './components/about/about.component';
import { CopyrightComponent } from './components/footer/copyright/copyright.component';
import { FullPageComponent } from './full-page/full-page.component';
import { SoftSkillComponent } from './components/soft-skill/soft-skill.component';
import {IgxChipsModule, IgxIconModule} from "igniteui-angular";

@NgModule({
  declarations: [
    AppComponent,
    NotaComponent,
    AlertComponent,
    LoaderCasoComponent,
    FooterComponent,
    AboutComponent,
    CopyrightComponent,
    FullPageComponent,
    SoftSkillComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MdbAccordionModule,
    MdbCarouselModule,
    MdbCheckboxModule,
    MdbCollapseModule,
    MdbDropdownModule,
    MdbFormsModule,
    MdbModalModule,
    MdbPopoverModule,
    MdbRadioModule,
    MdbRangeModule,
    MdbRippleModule,
    MdbScrollspyModule,
    MdbTabsModule,
    MdbTooltipModule,
    MdbValidationModule,
    BrowserAnimationsModule,
    AlertModule,
    IconModule,
    HttpClientModule,
    AvatarModule,
    SpinnerModule,
    IgxChipsModule,
    IgxIconModule
  ],
  providers: [LoaderDataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
