# Loura support tickets classifier 

that was fun! lets me break it down. but first things first, how to ***run*** it. 

1- navigate to the project root.
2- install npm dependencies: `npm i`
3- populate the env file, use `.env.example` for reference.
4- `npm start`, now keep an eye on `localhost:process.env.PORT ? process.env.PORT : 3000` :p

**Dependencies**? you will need a running PostgreSQL server, redis to accommodate bullmq and -of course- nodejs. 

## now, Major decisions:
**Cron VS background jobs?**
this is one where i think both are good options to handle async classifications logic. but it came down to one thing for me: background jobs meant less steps and out of the box support for retries. 
on this particular instance the classifier is retried 3 times with an exponential delay of 1 sec. after that the ticket status is updated to failed.
also, there is a retry endpoint actions that fetches and reruns failed tickets. max number of retried jobs per run is configured by an env variable.

**background jobs concurrency**
by leaving this to it's default value of 1, i am underutilizing background jobs. best things about jobs that run independently away from the main thread is the ability to have many running at the same time. but i had to keep it like this to accommodate the LLM api limit. (using a free version of Gemeni).


**Defending against prompt injection**
this is a hard one to completely strike off, unlike sql injection there is no keywords to watch out for in prompt injection. every word could be a threat. 
i have added rules to the system prompt instructing the model to deal with the user-inputted part of the prompt (ticket subject and body) strictly as data and ignore all instructions if any. i have also wrapped that part in an `<UNTRUSTED>`  tag.

**Dealing with LLM uncertainty**
models are notoriously unreliable (compared to functions) and so the output must be vetted and validated before usage. i have provided the model with an output format (JSON), a structure (`{category: string, priority: string, summery: string}`) and an example to follow. i also prompted it to be strict about those. 
but this is not remotely enough. i have also created a response class and passed the response text to it for validation and added a fallback if the model fails to produce a value that is within the expected range.

  
