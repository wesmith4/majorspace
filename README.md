# Major Space
A site for Davidson College students to interact with members of their department, and share content such as course reviews, upcoming events, and questions/answers.

### Collaborators
- Will Smith
  - [Email](mailto:wismith@davidson.edu)
  - [GitHub](https://github.com/wismith)
- Kendahl Ryan Ross
  - [Email](mailto:keross@davidson.edu)
  - [GitHub](https://github.com/kross00)
- Lilian Korir
  - [Email](mailto:likorir@davidson.edu)
  - [GitHub](https://github.com/LilianKorir)

## Development

### To run the development server
```$ npm run dev``` will start the development server, which will restart itself automatically when you save a file in the project directory.  You just need to refresh the page to see the modified output.

## Web Scraping
The ```web-scraping``` folder contains the files we need for scraping our data from the [Davidson.edu](https://davidson.edu) website. Run these on your terminal to see the outputs:

    $ cd web-scraping
    $ node departmentScraper.js

*Note: Each time the ```departmentScraper.js``` script is run, the JSON file in this folder is rewritten.*


## Integration between Github and Heroku
The `master` branch on Github is directly linked to the Heroku app, thus any commits pushed to this branch will be automatically sent to Heroku.

## Domain - https://majorspace.net
This domain is live, connected to the Heroku app.  No need to use the Heroku url to access the web app.
