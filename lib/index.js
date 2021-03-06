const unfurlToAttachment = require('./unfurl-to-attachment')
const attachments = require('probot-attachments')
const getLinks = require('./get-links')

module.exports = (robot) => {
  robot.on(['issue_comment.created'], checkUnfurl)

  async function checkUnfurl (context) {
    // Get the rendered HTML of the comment from GitHub
    const comment = await context.github.issues.getComment(context.repo({
      id: context.payload.comment.id,
      headers: {accept: 'application/vnd.github.html+json'}
    }))

    // Find all the links
    const links = getLinks(comment.data.body_html)

    if (links.length > 0) {
      robot.log(links, 'Unfurling links')

      // Unfurl them into attachments
      const unfurls = await Promise.all(links.map(link => unfurlToAttachment(link)))

      robot.log.trace(unfurls, 'Unfurled links')

      // Attach unfurled links to the comment
      return attachments(context).add(unfurls)
    }
  }
}
