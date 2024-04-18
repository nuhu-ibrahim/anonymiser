# Anonymiser

## Introduction
This project was created as part of The `University of Manchester` and `Jackson Lees Group (JLG)` `AKT project`. The aim of this project is to effectively anonymise personal data about JLG clients before processing them on the cloud or using them to train or fine-tune large language models. 

## Initial Setup
Please follow the steps below to setup this anonymisation tool on your local computer.

- Please follow the steps on this link [How to install nodejs](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) prepared by the NodeJS team to install `NodeJS` on your computer.

- Clone this repository to any folder location of your choice on your Personal Computer.

- Open your command prompt and navigate to the folder where you have cloned this repository.

## Using the anonymiser
- Run the `command` below to install all dependencies:
```console
:~$ npm install
```
- Create an `excel` file with a `sheet` and add all the text data to be anonymised in the `first column`. Sample excel sheet can be found in this repository named `data_to_anonymise.xlsx`.

- Run the `command` below to anonymise data in the excel sheet:
```console
:~$ node index.js <location of file to anonymise> <location of anonymisation result>

# example
:~$ node index.js data_to_anonymise.xlsx anonymised_data.xlsx
```

The example above will anonymise data in the excel file named `data_to_anonymise.xlsx` in the root repository directory and export the result into an excel file named `anonymised_data.xlsx` in the root repository directory. Sample of the anonymised result can be found in this repository named `anonymised_data.xlsx`.

## Credits
[nitaiaharoni1 on Github](https://github.com/nitaiaharoni1/anonymize-nlp)

