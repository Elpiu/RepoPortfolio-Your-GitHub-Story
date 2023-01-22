import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MdbAccordionModule} from 'mdb-angular-ui-kit/accordion';
import {MdbCarouselModule} from 'mdb-angular-ui-kit/carousel';
import {MdbCheckboxModule} from 'mdb-angular-ui-kit/checkbox';
import {MdbCollapseModule} from 'mdb-angular-ui-kit/collapse';
import {MdbDropdownModule} from 'mdb-angular-ui-kit/dropdown';
import {MdbFormsModule} from 'mdb-angular-ui-kit/forms';
import {MdbModalModule} from 'mdb-angular-ui-kit/modal';
import {MdbPopoverModule} from 'mdb-angular-ui-kit/popover';
import {MdbRadioModule} from 'mdb-angular-ui-kit/radio';
import {MdbRangeModule} from 'mdb-angular-ui-kit/range';
import {MdbRippleModule} from 'mdb-angular-ui-kit/ripple';
import {MdbScrollspyModule} from 'mdb-angular-ui-kit/scrollspy';
import {MdbTabsModule} from 'mdb-angular-ui-kit/tabs';
import {MdbTooltipModule} from 'mdb-angular-ui-kit/tooltip';
import {MdbValidationModule} from 'mdb-angular-ui-kit/validation';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    AlertModule,
    AvatarModule, ButtonModule,
    CardModule,
    CollapseModule,
    GridModule,
    ListGroupModule,
    ModalModule
} from '@coreui/angular';
import {IconModule} from '@coreui/icons-angular';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {LoaderDataService} from './services/loader-data.service';
import {SpinnerModule} from '@coreui/angular';
import {LoaderCasoComponent} from './components/loader-caso/loader-caso.component';
import {FooterComponent} from './components/footer/footer.component';
import {AboutComponent} from './components/about/about.component';
import {CopyrightComponent} from './components/footer/copyright/copyright.component';
import {FullPageComponent} from './full-page/full-page.component';
import {SoftSkillComponent} from './components/soft-skill/soft-skill.component';
import {
  IgxButtonGroupModule,
  IgxChipsModule,
  IgxIconModule,
  IgxInputGroupModule,
  IgxRadioModule,
  IgxStepperModule
} from "igniteui-angular";
import {MenuFullScreenComponent} from './components/menu-full-screen/menu-full-screen.component';
import {ItemOfMenuComponent} from './components/menu-full-screen/item-of-menu/item-of-menu.component';
import {FormsModule} from "@angular/forms";
import {ItemChipDragComponent} from './components/soft-skill/item-chip-drag/item-chip-drag.component';
import {DragDropModule} from "@angular/cdk/drag-drop";
import {RoadMapStepperComponent} from './components/road-map-stepper/road-map-stepper.component';
import {MatStepperModule} from "@angular/material/stepper";
import {IntroComponent} from './components/intro/intro.component';
import {ImageConBgComponent} from './components/intro/image-con-bg/image-con-bg.component';
import {ProgettiComponent} from './components/progetti/progetti.component';
import {LoaderApiGithubService} from "./services/loader-api-github.service";
import {CardProgettoComponent} from './components/progetti/card-progetto/card-progetto.component';
import {ModalProgettoComponent} from './components/progetti/modal-progetto/modal-progetto.component';
import {MarkdownModule, MarkdownService, MarkedOptions} from 'ngx-markdown';


@NgModule({
  declarations: [
    AppComponent,
    LoaderCasoComponent,
    FooterComponent,
    AboutComponent,
    CopyrightComponent,
    FullPageComponent,
    SoftSkillComponent,
    MenuFullScreenComponent,
    ItemOfMenuComponent,
    ItemChipDragComponent,
    RoadMapStepperComponent,
    IntroComponent,
    ImageConBgComponent,
    ProgettiComponent,
    CardProgettoComponent,
    ModalProgettoComponent,

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
        IgxIconModule,
        CardModule,
        ListGroupModule,
        FormsModule,
        DragDropModule,
        MatStepperModule,
        IgxStepperModule,
        IgxRadioModule,
        IgxButtonGroupModule,
        IgxInputGroupModule,
        CollapseModule,
        ModalModule,
        MarkdownModule,
        MarkdownModule.forRoot({
            loader: HttpClient,
            markedOptions: {
                provide: MarkedOptions,
                useValue: {
                    gfm: true,
                    breaks: false,
                    pedantic: false,
                    smartLists: true,
                    smartypants: false,
                    sanitize: false
                },
            },
        }),
        GridModule,
        ButtonModule,
    ],
  providers: [
    LoaderDataService,
    LoaderApiGithubService,
    MarkdownService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
