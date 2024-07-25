const express = require('express');
const bodyParser = require('body-parser')
const anonymizeNlp = require("anonymize-nlp")
const app = express();
const port = 3000;

// create application/json parser
const jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.get('/', (req, res) => {
  res.send('Pinged!');
});

app.post('/api/anonymise', jsonParser, (req, res) => {
  try {
    const emails = req.body.emails;
    // const anonymizer = new anonymizeNlp.AnonymizeNlp();

    // Create an instance of AnonymizeNlp excluding 'apikey'
    const typesToExclude = ['date', 'apikey', 'money', 'phonenumber', 'time', 'creditcard', 'ip', 'token', 'zip_code', 'crypto', 'id', 'apikey'];
    const anonymizeTypeOptions = [
      'email', 'firstname', 'lastname', 'organization', 'domain', 'url'
    ];

    const anonymizer = new anonymizeNlp.AnonymizeNlp(anonymizeTypeOptions, typesToExclude);

    var anonymizedEmails = [];
    emails.forEach((email) => {
      // replace numbers with random ones
      // Patterns to identify different date formats
      const datePatterns = [
        { regex: /\b(\d{4})-(\d{2})-(\d{2})\b/gi, format: 'YYYY-MM-DD' }, // YYYY-MM-DD
        { regex: /\b(\d{2})-(\d{2})-(\d{4})\b/gi, format: 'DD-MM-YYYY' }, // DD-MM-YYYY
        { regex: /\b(\d{2})\/(\d{2})\/(\d{4})\b/gi, format: 'MM/DD/YYYY' }, // MM/DD/YYYY
        { regex: /\b(\d{2})\/(\d{2})\/(\d{2})\b/gi, format: 'MM/DD/YY' }, // MM/DD/YY
        { regex: /\b(\d{4})\.(\d{2})\.(\d{2})\b/gi, format: 'YYYY.MM.DD' }, // YYYY.MM.DD
        { regex: /\b(\d{2})\.(\d{2})\.(\d{4})\b/gi, format: 'DD.MM.YYYY' }, // DD.MM.YYYY
        { regex: /\b(\d{4})\b/gi, format: 'YYYY' }, // YYYY
        { regex: /\b(January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2}), (\d{4})\b/gi, format: 'Month DD, YYYY' }, // Month DD, YYYY
        { regex: /\b(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})\b/gi, format: 'DD Month YYYY' }, // DD Month YYYY
        { regex: /\b(\d{1,2})(st|nd|rd|th) (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})\b/gi, format: 'DDth Month YYYY' } // DDth Month YYYY
      ];

      const randomDate = () => {
        const start = new Date(1996, 0, 1);
        const end = new Date(2028, 12, 12);
        const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return date;
      };

      const formatRandomDate = (format) => {
        const date = randomDate();
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2); // Ensure two digits
        const day = ('0' + date.getDate()).slice(-2); // Ensure two digits
        const monthName = date.toLocaleString('default', { month: 'long' });
        const dayWithSuffix = `${day}${getDaySuffix(day)}`;

        switch (format) {
          case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
          case 'DD-MM-YYYY':
            return `${day}-${month}-${year}`;
          case 'MM/DD/YYYY':
            return `${month}/${day}/${year}`;
          case 'MM/DD/YY':
            return `${month}/${day}/${year.toString().slice(-2)}`;
          case 'YYYY.MM.DD':
            return `${year}.${month}.${day}`;
          case 'DD.MM.YYYY':
            return `${day}.${month}.${year}`;
          case 'Month DD, YYYY':
            return `${monthName} ${day}, ${year}`;
          case 'DD Month YYYY':
            return `${day} ${monthName} ${year}`;
          case 'DDth Month YYYY':
            return `${dayWithSuffix} ${monthName} ${year}`;
          case 'YYYY':
            return `${year}`;
          default:
            return `${year}-${month}-${day}`;
        }
      };

      const replaceNumberWithRandom = (match) => {
        const length = match.length;
        const min = Math.pow(10, length - 1); // minimum number with the same number of digits
        const max = Math.pow(10, length) - 1; // maximum number with the same number of digits
        return Math.floor(Math.random() * (max - min + 1) + min).toString();
      };

      const getDaySuffix = (day) => {
        const j = day % 10,
          k = day % 100;
        if (j === 1 && k !== 11) {
          return "st";
        }
        if (j === 2 && k !== 12) {
          return "nd";
        }
        if (j === 3 && k !== 13) {
          return "rd";
        }
        return "th";
      };

      // Store random dates in an array to avoid re-replacing them
      const placeholders = [];
      let placeholderIndex = 0;

      // First replace dates with placeholders
      for (let { regex, format } of datePatterns) {
        email = email.replace(regex, (match) => {
          const randomDateStr = formatRandomDate(format);
          placeholders.push(randomDateStr);
          return `__PLACEHOLDER_${placeholderIndex++}__`;
        });
      }
      
      // Then replace remaining numbers with random numbers of the same length
      email = email.replace(/(?<!__PLACEHOLDER_)\d+/g, replaceNumberWithRandom);

      // Replace placeholders with the actual random dates
      placeholders.forEach((date, index) => {
        email = email.replace(`__PLACEHOLDER_${index}__`, date);
      });

      const anonymizedText = anonymizer.anonymize(email);
      anonymizedEmails.push(anonymizedText);
    });
  } catch (err) {
    console.error("Something went wrong while annonymising data. Error message: " + err.message);
  };

  // send a response with the anonymised emails
  res.send({
    "emails": anonymizedEmails});
});