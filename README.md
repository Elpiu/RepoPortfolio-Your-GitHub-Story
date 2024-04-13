### New Version 3 Next.js 

Questo progetto è una versione aggiornata del suo predecessore, realizzato solo con CSS, JS e HTML. Con questa versione, è stato fatto il porting utilizzando il framework Angular, rendendolo più dinamico e facile da gestire. Inoltre, i dati del sito portfolio sono caricati dal file "asset/data/database.json", rendendo più semplice l'aggiornamento del contenuto del sito.
Tuttavia, la cartella contenente il vecchio sito verrà comunque mantenuta per riferimento.



---
### GitHub Portfolio
Questo progetto è un sito web dinamico per il portfolio che si aggiorna automaticamente con le repository di GitHub dell'utente. La sezione del portfolio viene generata da uno script che, dato il profilo GitHub dell'utente, recupera le repository pubbliche dell'utente e le crea dinamicamente nella sezione del portfolio. Inoltre, il file README.md di ogni repository viene anche caricato dinamicamente all'interno di una finestra modale sulla pagina del portfolio. Ciò consente un portfolio costantemente aggiornato e facilmente accessibile dei progetti dell'utente.

### NOTE
Per renderizzare correttamente le immagini dei progetti nel Readme.md, è necessario che vengano linkate da github (tutto il percorso https//github.../nome-repo/img/nomefoto.png) e non dal percorso locale.

Questo problema accade per via della traduzione del file .md una volta preso e tradotto all'interno dell'html.

Per fare ciò è stata utilizzata la libreria ngx-markdown.

---



### Tema
- more dark #212529
- dark #2c3e50
- main #1abc9c




# ProgettoProva

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.10.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
