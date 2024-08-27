# How to run the project

## Basic Setup
- Install node.js and set up the environment
- Install any IDE (I use VS Code though)
- Clone the project to your local environment
- In the root project inside data folder, create a `data.json` file in this format - 
```js
{
    "studyData": {},
    "count": 0
}
```

- Create a .env file in the root directory with the durationn layers details for example:
```js
LAYER_DURATIONS = [0, 7, 20, 50, 100] // or you may add your own duration layers
```
- Install all the dependencies by running `npm install`
- Then run `npm run dev` to start the project
- You should get `{}` as the output if everything went well.

## Adding Study data
- Inside index.js file there is this commented code. 
```js
// add a new topic to the database
// console.log(revisionController.addStudyData({
//     'topic': 'Random topic for test',
//     'subject': 'OS',
//     'additionalInfo': 'Video no. 1.1, page no. 1-6'
// }))
```
- Uncomment this, add your data save it and coment it again.
- You should get an output like this - 
```js
{
    message: 'Study data added successfully'
}
```

## Updating revision count of a Study data
- Inside index.js file there is this commented code. 
```js
// update revision count for a topic
// console.log(revisionController.updateRevisionCount(1));
```
- Uncomment this, add the id of the topic you want to revise(see the id in the output console) save it and coment it again.
- You should get an output like this - 
```js
{
    message: 'Study data updated successfully'
}
```

## Seeing the topics you need to revise
- This part of the code in index.js file is responsible for getting revision data  
```js
// get revision topics
print(revisionController.calculateRevision())
```

# Errors and troubleshoot
## 1. Run `npm install` before starting the project
## 2. Infinite loop when trying to add new data
- As `nodemon` listens to the changes occur in any javascript file in the code, it so happens that adding new data to `data.json` file also triggers nodemon to restart the server and you end-up in infinite loop.
- To fix this problem, you should tell nodemon to not listen to changes in `data.json` file.
- Add this `nodemon.json` file to your root directory with this code and you should be good to go.
```js
{
    "ignore": ["./data/data.json"]
}
```

If you like this, give this repo a star! 
Made with ❤️ By [Bibhu Prasad Sahoo](https://linkedin.com/in/bibhuprasadsahoo)

# Connect with me
- Linkedin - [Bibhu Prasad Sahoo](https://linkedin.com/in/bibhuprasadsahoo)
- Leetcode - [19btcse09](https://leetcode.com/u/19btcse09)
- Whatsapp - [whatsapp](https://wa.me/7735605546)