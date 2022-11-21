const nodemailer = require('nodemailer');
var ses = require('nodemailer-ses-transport');
const filehandler = require('./file_handler');
const { Reach } = require('reach-sdk');
Reach.init();

module.exports = {
   sendVisualMail,
   sendXPathMail,
   getVisualChangeHtml,
   getXPathChangeHtml,
   getResetPasswordHtml,
   replaceTextWithVariables,
   getReachProviders,
   getReachParameters
};

function getReachProviders(req, res, next) {
   res.json(Reach.listProviders());
}

function getReachParameters(req, res, next) {
   res.json(Reach.parameters(req.params.provider));
}

var transporter;

if (process.env.MAILSYSTEM === "SES") {
   transporter = nodemailer.createTransport(ses({
      accessKeyId: process.env.SES_ACCESS_KEY,
      secretAccessKey: process.env.SES_ACCESS_SECRET
   }));
} else {
   transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
      },
      tls:{
        rejectUnauthorized:false
      }
    });
}

function replaceTextWithVariables(text, oVariables) {
   try {
      var newText = text;
      for (const property in oVariables) {
         newText = newText.split('{{' + property + '}}').join(oVariables[property]);
      }
      return newText;
   } catch (err) {
      console.log(err);
   }
}

function getEmailLogos() {
   try {
      var attachments = [];
      attachments.push(
         {
            filename: 'logo-url.png',
            path: filehandler.createLocalFilePath("assets/logo-url.png"),
            cid: 'logo'
         })
      attachments.push(
         {
            filename: 'logo-text.png',
            path: filehandler.createLocalFilePath("assets/logo-text.png"),
            cid: 'logoText'
         }
      )
      return attachments;
   } catch(err) {
      console.log(err);
      return [];
   }
}

function sendVisualMail(notification, body, subject, htmlbody, screenshot_diff, screenshot, type) {
   var attachments = [];
   try {
      attachments = getEmailLogos();

      if (type === "change") {
         attachments.push({
            filename: 'screenshot.png',
            path: filehandler.createFilePath(screenshot),
            cid: 'screenshot'
         })
         attachments.push({
            filename: 'screenshot_diff.png',
            path: filehandler.createFilePath(screenshot_diff),
            cid: 'screenshot_diff'
         })
      }

      notification.required.subject = subject;
      notification.required.text = body;
      notification.optional.html = htmlbody;
      notification.optional.attachments = attachments;
      notification.optional.smtpSecure = false;

      Reach.send(notification);
   } catch (err) {
      console.log(err);
   }
}

function sendXPathMail(recipient, body, subject, htmlbody, type) {
   var attachments = [];
   attachments = getEmailLogos();

   transporter.sendMail({
      from: "Changd <" + process.env.EMAIL_FROM + ">",
      to: recipient,
      subject: subject,
      text: body,
      html: htmlbody,
      attachments: attachments
   });
}

function getResetPasswordHtml() {
   const html = getEmailHeader() + `
 <div class="notice-wrap margin-bottom" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; margin: 0px auto; max-width: 560px; margin-bottom: 15px;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
       <tbody>
          <tr>
             <td style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; direction: ltr; font-size: 0px; padding: 0px; text-align: center;" align="center">
                <!--[if mso | IE]> 
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                   <tr>
                      <td class="" style="vertical-align:top;width:560px;" >
                         <![endif]--> 
                         <div class="column-per-100 outlook-group-fix" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: top; width: 100%;">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                               <tbody>
                                  <tr>
                                     <td style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; background-color: #ffffff; border-radius: 10px; vertical-align: top; padding: 30px 25px;" bgcolor="#ffffff" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style width="100%">
                                           <tr>
                                              <td align="left" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 0px; padding: 0; word-break: break-word;">
                                                 <div style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 26px; font-weight: bold; line-height: 30px; text-align: left; color: #4F4F4F;">{{title}}</div>
                                              </td>
                                           </tr>
                                           <tr>
                                              <td align="left" class="link-wrap" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 0px; padding: 0; padding-bottom: 0px; word-break: break-word;">
 
 
                                                 <div style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 25px; text-align: left; color: #4F4F4F;"><br> 
                                                 Click <a href="` + process.env.DOMAIN + `/setpassword?token={{token}}">here</a> to reset your password
                                                 </div>
                                             </td>
                                           </tr>
                                        </table>
                                     </td>
                                  </tr>
                               </tbody>
                            </table>
                         </div>
                         <!--[if mso | IE]> 
                      </td>
                   </tr>
                </table>
                <![endif]--> 
             </td>
          </tr>
       </tbody>
    </table>
 </div>
 <!--[if mso | IE]> 
 </td>
 </tr>
 </table>
 </td>
 </tr>
 <![endif]--> 
 
 <!--[if mso | IE]> 
 </table>
 <![endif]--> 
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 <!--[if mso | IE]> 
 </td>
 </tr>
 </table>
 ` + getEmailFooter();
   return html;
}


function getVisualChangeHtml() {
   const html = getEmailHeader() + `
 <div class="notice-wrap margin-bottom" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; margin: 0px auto; max-width: 560px; margin-bottom: 15px; margin-top: 15px;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
       <tbody>
          <tr>
             <td style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; direction: ltr; font-size: 0px; padding: 0px; text-align: center;" align="center">
                <!--[if mso | IE]> 
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                   <tr>
                      <td class="" style="vertical-align:top;width:560px;" >
                         <![endif]--> 
                         <div class="column-per-100 outlook-group-fix" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: top; width: 100%;">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                               <tbody>
                                  <tr>
                                     <td style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; background-color: #ffffff; border-radius: 10px; vertical-align: top; padding: 30px 25px;" bgcolor="#ffffff" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style width="100%">
                                           <tr>
                                              <td align="left" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 0px; padding: 0; word-break: break-word;">
                                                 <div style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 26px; font-weight: bold; line-height: 30px; text-align: left; color: #4F4F4F;">{{title}}</div>
                                              </td>
                                           </tr>
                                           <tr>
                                              <td align="left" class="link-wrap" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 0px; padding: 0; padding-bottom: 20px; word-break: break-word;">
  
                                                 <div style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 25px; text-align: left; color: #4F4F4F;"><br> 
                                                 We detected a {{percent_change}} on this <a href="{{url}}">site</a>.<br>
                                                 <br></div>
                                                 <img width="200px" style="object-position:100% 0; width: 100%;" src="cid:screenshot" />

                                             </td>
                                          </tr>
                                          <tr>
                                             <td align="left" class="link-wrap" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 0px; padding: 0; padding-bottom: 20px; word-break: break-word; margin-top: 40px;">
  
                                                 <div style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 25px; text-align: left; color: #4F4F4F;"><br> 
                                                 Differences<br>
                                                 <br></div>
                                                 <img width="200px" style="object-position:100% 0; width: 100%;" src="cid:screenshot_diff" />

                                             </td>
                                           </tr>
                                        </table>
                                     </td>
                                  </tr>
                               </tbody>
                            </table>
                         </div>
                         <!--[if mso | IE]> 
                      </td>
                   </tr>
                </table>
                <![endif]--> 
             </td>
          </tr>
       </tbody>
    </table>
 </div>
 <!--[if mso | IE]> 
 </td>
 </tr>
 </table>
 </td>
 </tr>
 <![endif]--> 
 
 <!--[if mso | IE]> 
 </table>
 <![endif]--> 
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 <!--[if mso | IE]> 
 </td>
 </tr>
 </table>
 ` + getEmailFooter();
   return html;
}


function getXPathChangeHtml() {
   const html = getEmailHeader() + `
 <div class="notice-wrap margin-bottom" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; margin: 0px auto; max-width: 560px; margin-bottom: 15px; margin-top: 15px;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
       <tbody>
          <tr>
             <td style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; direction: ltr; font-size: 0px; padding: 0px; text-align: center;" align="center">
                <!--[if mso | IE]> 
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                   <tr>
                      <td class="" style="vertical-align:top;width:560px;" >
                         <![endif]--> 
                         <div class="column-per-100 outlook-group-fix" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: top; width: 100%;">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                               <tbody>
                                  <tr>
                                     <td style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; background-color: #ffffff; border-radius: 10px; vertical-align: top; padding: 30px 25px;" bgcolor="#ffffff" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style width="100%">
                                           <tr>
                                              <td align="left" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 0px; padding: 0; word-break: break-word;">
                                                 <div style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 26px; font-weight: bold; line-height: 30px; text-align: left; color: #4F4F4F;">{{title}}</div>
                                              </td>
                                           </tr>
                                           <tr>
                                              <td align="left" class="link-wrap" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 0px; padding: 0; padding-bottom: 20px; word-break: break-word;">
  
                                                 <div style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 25px; text-align: left; color: #4F4F4F;"><br> 
                                                 We detected a change on this <a href="{{url}}">site</a>.<br>
                                                 <br>
                                                 New Text:
                                                 <br>
                                                 {{screenshot_diff}}
                                                 <br>
                                                 <br>
                                                 Previous Text:
                                                 <br>
                                                 {{screenshot}}
                                                 </div>
                                             </td>
                                          </tr>
                                        </table>
                                     </td>
                                  </tr>
                               </tbody>
                            </table>
                         </div>
                         <!--[if mso | IE]> 
                      </td>
                   </tr>
                </table>
                <![endif]--> 
             </td>
          </tr>
       </tbody>
    </table>
 </div>
 <!--[if mso | IE]> 
 </td>
 </tr>
 </table>
 </td>
 </tr>
 <![endif]--> 
 
 <!--[if mso | IE]> 
 </table>
 <![endif]--> 
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 <!--[if mso | IE]> 
 </td>
 </tr>
 </table>
 ` + getEmailFooter();
   return html;
}




function getEmailHeader() {
   return `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<title></title>
<!--[if !mso]><!-- --> 
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<!--<![endif]--> 
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style type="text/css"> span.productOldPrice { color: #A0131C; text-decoration: line-through;} #outlook a { padding: 0; } body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; } table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; } img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; } p { display: block; margin: 13px 0; } </style>
<!--[if mso]> 
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]--> <!--[if lte mso 11]> 
<style type="text/css"> .outlook-group-fix { width:100% !important; } </style>
<![endif]--> <!--[if !mso]><!--> 
<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,700" rel="stylesheet" type="text/css">
<style type="text/css"> @import url(https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,700); </style>
<!--<![endif]--> 
<style type="text/css"> @media only screen and (min-width:480px) { .column-per-100 { width: 100% !important; max-width: 100%; } .column-per-25 { width: 25% !important; max-width: 25%; } .column-per-75 { width: 75% !important; max-width: 75%; } .column-per-48-4 { width: 48.4% !important; max-width: 48.4%; } .column-per-50 { width: 50% !important; max-width: 50%; } } </style>
<style type="text/css"> @media only screen and (max-width:480px) { table.full-width-mobile { width: 100% !important; } td.full-width-mobile { width: auto !important; } } noinput.menu-checkbox { display: block !important; max-height: none !important; visibility: visible !important; } @media only screen and (max-width:480px) { .menu-checkbox[type="checkbox"]~.inline-links { display: none !important; } .menu-checkbox[type="checkbox"]:checked~.inline-links, .menu-checkbox[type="checkbox"]~.menu-trigger { display: block !important; max-width: none !important; max-height: none !important; font-size: inherit !important; } .menu-checkbox[type="checkbox"]~.inline-links>a { display: block !important; } .menu-checkbox[type="checkbox"]:checked~.menu-trigger .menu-icon-close { display: block !important; } .menu-checkbox[type="checkbox"]:checked~.menu-trigger .menu-icon-open { display: none !important; } } </style>
<style type="text/css"> @media only screen and (min-width:481px) { .products-list-table img { width: 120px !important; display: block; } .products-list-table .image-column { width: 20% !important; } } a { color: #000; } .server-img img { width: 100% } .server-box-one a, .server-box-two a { text-decoration: underline; color: #2E9CC3; } .server-img img { width: 100% } .server-box-one a, .server-box-two a { text-decoration: underline; color: #2E9CC3; } .server-img img { width: 100% } .server-box-one a, .server-box-two a { text-decoration: underline; color: #2E9CC3; } </style>
</head>
<body style="background-color:#FFFFFF; margin-top: 20px; padding-top: 20px;">
<div style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; background-color: #FFFFFF;">
<!-- Body Wrapper --> <!--[if mso | IE]> 
<table align="center" border="0" cellpadding="0" cellspacing="0" class="body-wrapper-outlook" style="width:600px;" width="600" >
<tr>
<td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
<![endif]--> 
<div class="body-wrapper" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; padding-bottom: 20px; box-shadow: 0 4px 10px #ddd; background: #F2F2F2; background-color: #F2F2F2; margin: 0px auto; max-width: 600px; margin-bottom: 10px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#F2F2F2;background-color:#F2F2F2;width:100%;">
<tbody>
<tr>
<td style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; direction: ltr; font-size: 0px; padding: 10px 20px; text-align: center;" align="center">
<!--[if mso | IE]> 
<table role="presentation" border="0" cellpadding="0" cellspacing="0">
<![endif]--> <!-- Pre-Headers --> <!--[if mso | IE]> 
<tr>
<td class="pre-header-outlook" width="600px" >
<table align="center" border="0" cellpadding="0" cellspacing="0" class="pre-header-outlook" style="width:560px;" width="560" >
<tr>
<td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
<![endif]--> 
<div class="pre-header" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; height: 1px; overflow: hidden; margin: 0px auto; max-width: 560px;">
   <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
      <tbody>
         <tr>
            <td style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; direction: ltr; font-size: 0px; padding: 0px; text-align: center;" align="center">
               <!--[if mso | IE]> 
               <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                     <td class="" style="vertical-align:top;width:560px;" >
                        <![endif]--> 
                        <div class="column-per-100 outlook-group-fix" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: top; width: 100%;">
                           <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                              <tr>
                                 <td align="center" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 0px; padding: 0; word-break: break-word;">
                                    <div style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 1px; font-weight: 400; line-height: 0; text-align: center; color: #F2F2F2;"></div>
                                 </td>
                              </tr>
                           </table>
                        </div>
                        <!--[if mso | IE]> 
                     </td>
                  </tr>
               </table>
               <![endif]--> 
            </td>
         </tr>
      </tbody>
   </table>
</div>
<!--[if mso | IE]> 
</td>
</tr>
</table>
</td>
</tr>
<![endif]--> <!-- header --> <!--[if mso | IE]> 
<tr>
<td class="header-outlook" width="600px" >
<table align="center" border="0" cellpadding="0" cellspacing="0" class="header-outlook" style="width:560px;" width="560" >
<tr>
<td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
<![endif]--> 
<div class="header" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; line-height: 22px; padding: 15px 0; margin: 0px auto; max-width: 560px;">
   <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
      <tbody>
         <tr>
            <td style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; direction: ltr; font-size: 0px; padding: 0px; text-align: center;" align="center">
               <!--[if mso | IE]> 
               <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                     <![endif]--> <!-- LOGO --> <!--[if mso | IE]> 
                     <td class="" style="vertical-align:middle;width:140px;" >
                        <![endif]--> 
                        <div class="column-per-25 outlook-group-fix" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: middle; width: 100%;">
                           <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%">
                              <tr>
                                 <td align="center" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 0px; padding: 0; word-break: break-word;">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                       <tbody>
                                          <tr>
                                             <td style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif;width: 200px;" width="200">
                                                <a href="` + process.env.DOMAIN + `" target="_blank" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; padding: 0 10px;">
                                                   <img style="width: 200px;" src="cid:logo" />
                                                </a>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                 </td>
                              </tr>
                           </table>
                        </div>
                        <!--[if mso | IE]> 
                     </td>
                     <![endif]--> <!-- Navigation Bar --> <!--[if mso | IE]> 
                     <td class="navigation-bar-outlook" style="vertical-align:middle;width:420px;" >
                        <![endif]--> 
                        <div class="column-per-75 outlook-group-fix navigation-bar" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: middle; width: 100%;">
                           <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%">
                              <tr>
                                 <td align="left" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif; text-align: right; font-size: 0px; word-break: break-word;">
                                    <div class="inline-links" style="font-family: Open Sans, Helvetica, Tahoma, Arial, sans-serif;">
                                       <!--[if mso | IE]> 
                                       <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                                          <tr>
                                             <td style="padding:15px 10px;">
                                                <![endif]-->
                                                
                                                <!--[if mso | IE]> 
                                             </td>
                                          </tr>

                                       </table>
                                       <![endif]--> 
                                    </div>
                                 </td>
                              </tr>
                           </table>
                        </div>
                        <!--[if mso | IE]> 
                     </td>
                  </tr>
               </table>
               <![endif]--> 
            </td>
         </tr>
      </tbody>
   </table>
</div>
<!--[if mso | IE]> 
</td>
</tr>
</table>
</td>
</tr>
<![endif]--> <!-- notice --> <!--[if mso | IE]> 
<tr>
<td class="notice-wrap-outlook margin-bottom-outlook" width="600px" >
<table align="center" border="0" cellpadding="0" cellspacing="0" class="notice-wrap-outlook margin-bottom-outlook" style="width:560px;" width="560" >
<tr>
<td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
<![endif]-->`
}


function getEmailFooter() {
   return `<![endif]--> <!-- footer start --> <!-- Footer Wrapper -->
<div class="footer-wrapper" style="margin: 0px auto; max-width: 600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #FFFFFF; width: 100%;" width="100%" bgcolor="#FFFFFF">
<tbody>
<tr>
<td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
<!--[if mso | IE]>
<table role="presentation" border="0" cellpadding="0" cellspacing="0">
<![endif]-->
<!-- footer information -->
<!--[if mso | IE]>
<tr>
<td class="footer-information-outlook" width="600px">
   <table align="center" border="0" cellpadding="0" cellspacing="0" class="footer-information-outlook" style="width:600px;" width="600">
      <tr>
         <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
            <![endif]--> 
            <div class="footer-information" style="margin:0px auto;max-width:600px;">
               <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #FFFFFF; width: 100%;" width="100%" bgcolor="#FFFFFF">
                  <tbody>
                     <tr>
                        <td style="direction:ltr;font-size:0px;padding:0px;text-align:center;">
                           <!--[if mso | IE]>
                           <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                              <tr>
                                 <td class="" style="vertical-align:top;width:600px;">
                                    <![endif]-->
                                    <div class="column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                       <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #FFFFFF; vertical-align: top;" width="100%" valign="top" bgcolor="#FFFFFF">
                                          <tbody>
                                             <tr>
                                                <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                                   <div style="font-family:OpenSans, Helvetica, Tahoma, Arial, sans-serif;font-size:12px;font-weight:400;line-height:20px;text-align:center;color:#4F4F4F;">
                                                      <div>
                                                         <a href="` + process.env.DOMAIN + `" target="_blank" style="color: #333333; line-height: 20px; text-decoration: underline;">Home</a> | 
                                                         <a href="` + process.env.DOMAIN + `/jobs" target="_blank" style="color: #333333; line-height: 20px; text-decoration: underline;">My Jobs</a>
                                                      </div>
                                                      <br />
                                                         <img style="width: 150px;" src="cid:logoText" />
                                                      <br /><br />
                                                      &copy; 2021 Changd.app
                                                   </div>
                                                </td>
                                             </tr>
                                          </tbody>
                                       </table>
                                    </div>
                                    <!--[if mso | IE]>
                                 </td>
                              </tr>
                           </table>
                           <![endif]-->
                        </td>
                     </tr>
                  </tbody>
               </table>
            </div>
            <!--[if mso | IE]>
         </td>
      </tr>
   </table>
</td>
</tr>
<![endif]-->
<!-- footer logo -->
<!--[if mso | IE]>
</table>
<![endif]-->
</td>
</tr>
</tbody>
</table>
</div>
<!-- footer end --> 
</div>
</body>
</html>`
}