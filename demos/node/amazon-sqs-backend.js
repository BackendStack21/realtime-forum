const {getAuthToken} = require('./utils')
const AWS = require('@aws-sdk/client-sqs')

const {
  APP_ID,
  ADMIN_SIGNING_KEY, // For HS* signing algorithms, value should be "Admin Clients/Verification Key"
  ALGORITHM,
  CLUSTER_HOSTNAME,
  AMAZON_SQS_QUEUE_URL,
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
} = require('./config') // Import configuration constants

// Define the permissions for the publisher
const PUBLISHER_PERMISSIONS = {
  permissions: ['realtime:publisher:write:topic:*'],
}
// Define the publishing endpoint
const PUBLISHING_ENDPOINT = `https://${CLUSTER_HOSTNAME}/api/topics/${APP_ID}/publish`

// Initialize the AWS SQS service with the provided credentials
const sqs = new AWS.SQS({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
})

// Define the main function
async function init() {
  // Start processing SQS Queue messages
  while (true) {
    try {
      // Receive messages from the SQS queue
      const {Messages} = await sqs.receiveMessage({
        QueueUrl: AMAZON_SQS_QUEUE_URL,
        MaxNumberOfMessages: 5,
        WaitTimeSeconds: 20,
      })

      // If there are any messages
      if (Messages?.length > 0) {
        // Process each message
        for (const Message of Messages) {
          const {Body} = Message

          // Parse the message body
          const {msg} = JSON.parse(Body)
          const {client, payload, id} = msg
          // Define responding topic for the client
          const topic = `priv/${client.subject}`

          // Log the received message payload
          console.log('Received message payload: ', payload)

          // MESSAGE PROCESSING LOGIC GOES HERE

          // Prepare the options for the acknowledgement request
          const options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getAuthToken(
                ADMIN_SIGNING_KEY,
                5,
                PUBLISHER_PERMISSIONS,
                ALGORITHM,
                'backend',
              )}`,
            },
            body: JSON.stringify({
              topic,
              message: {
                type: 'response',
                ack: id,
                status: 'OK',
              },
            }),
          }

          // Send the acknowledgement request
          const response = await fetch(PUBLISHING_ENDPOINT, options)
          // Optionally log the response status
          console.log({
            statusText: response.statusText,
            status: response.status,
          })

          // Delete the processed message from the SQS queue
          await sqs.deleteMessage({
            QueueUrl: AMAZON_SQS_QUEUE_URL,
            ReceiptHandle: Message.ReceiptHandle,
          })
        }
      }
    } catch (err) {
      // Log any errors
      console.log(err)
    }
  }
}

// Call the main function
init()
