/* package list
 *
 * aldeed:simple-schema
 * aldeed:collection2
 * jedgee:slingshot@0.7.1
 * timbrandin:autoform-slingshot@1.1.0
 * aldeed:autoform
 */

if (Meteor.isServer) {
  Slingshot.createDirective('imageUploadDirective', Slingshot.S3Storage, {
    AWSAccessKeyId: Meteor.settings.amazon.key,
    AWSSecretAccessKey: Meteor.settings.amazon.secret,
    bucket: Meteor.settings.amazon.bucket.name,
    region: Meteor.settings.amazon.bucket.region,
    acl: 'public-read-write',
    authorize: function () {
      return true;
    },
    key: function (file) {
      return file.name;
    },
    allowedFileTypes: 'image/gif',
    maxSize: 10 * 1024 * 1024 // 10 MB (use null for unlimited)
  });

  Slingshot.createDirective('soundUploadDirective', Slingshot.S3Storage, {
    AWSAccessKeyId: Meteor.settings.amazon.key,
    AWSSecretAccessKey: Meteor.settings.amazon.secret,
    bucket: Meteor.settings.amazon.bucket.name,
    region: Meteor.settings.amazon.bucket.region,
    acl: 'public-read-write',
    authorize: function () {
      return true;
    },
    key: function (file) {
      return file.name;
    },
    allowedFileTypes: ['audio/mp3', 'audio/ogg'],
    maxSize: 10 * 1024 * 1024 // 10 MB (use null for unlimited)
  });
}


Gifs = new Mongo.Collection("gifs");

Gifs.attachSchema(new SimpleSchema({
  title: {
    type: String,
    max: 80
  },
  image: {
    type: String,
    autoform: {
      type: 'slingshotFileUpload',
      afFieldInput: {
        key: 'image',
        slingshotdirective: {
          directive: 'imageUploadDirective'
        }
      }
    }
  },
  sound: {
    type: String,
    autoform: {
      type: 'slingshotFileUpload',
      afFieldInput: {
        key: 'sound',
        slingshotdirective: {
          directive: 'soundUploadDirective',
          onBeforeUpload: function(file, callback) {
            getAudioBuffer(file, function(buffer) {
              if (buffer.duration < 10) {
                callback(file)
              } else {
                console.error('Audio length greater than 30')
              }
            })
          }
        }
      }
    }
  }
}));

function getAudioBuffer(file, callback) {
  var ctx = new (window.AudioContext || window.webkitAudioContext)();

  var reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onloadend = function() {
    ctx.decodeAudioData(reader.result, callback);
  }
}
