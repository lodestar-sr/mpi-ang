# Firebase Build/Deploy - mpi-proc-ang

#### Deployed webapp will be at both these URL's
* https://mpi-dev-proc.web.app
* https://mpi-dev-proc.firebase.app

---
#### **Deploy  History:**

If you need to know when/if a deployment was a success/finished, or see a deployment history with timestamp, the log is here:

* https://console.firebase.google.com/project/mpi-dev-proc/hosting/sites/mpi-dev-proc

---
### Resources

  * git repos:
      * https://bitbucket.org/bustedwhistle/mpi-proc-ang
      * https://bitbucket.org/bustedwhistle/mpi-proc-mapbox
      * https://bitbucket.org/bustedwhistle/mpi-proc-data
      * https://bitbucket.org/bustedwhistle/mpi-geocoding
  * gcp project:  `mpi-dev-proc`
      * https://console.cloud.google.com/home/dashboard?project=mpi-dev-proc
  * gce vm: `mpi-dev-proc1`
      * https://console.cloud.google.com/compute/instancesDetail/zones/us-west1-b/instances/mpi-dev-proc1?project=mpi-dev-proc
  * firebase project: `mpi-dev-proc`
      * https://console.firebase.google.com/project/mpi-dev-proc/overview

---
### Build/Deploy

To build/deploy this project, you will need to use a GCE VM.

The project is large and growing in the number of files, and disk size

The build time, file transfer time to Firebase times out when deploying from a GCE VM, and will be even slower deploying from your personal machine, and also incur costs of data transfer, that is not incurred by transferring files from within GCP. 

---
### GCE VM - Instance: `mpi-dev-proc1`
https://console.cloud.google.com/compute/instancesDetail/zones/us-west1-b/instances/mpi-dev-proc1?project=mpi-dev-proc
  
**Specs:**  
  * gcp project:    mpi-proc-dev
  * vm name:        mpi-proc-dev1
  * OS:             CentOS 7.6.1910 (and CentOS 8 is around the corner, will upgrade the day released)
  * Region:         us-west1
  * Zone:           us-west1-b
  * Specs:          4 vCPU, 7.5 GB, 100 GB SSD, preemptible
  * IP:             35.pending
    
---
#### Getting access to the VM

* Send me a preferred login id
* You can send me a ssh .pub key file that I will put into your account, or you can upload once you login.
* Request the `proc` account private key to ssh direct, that will allow you to bypass some steps. 

Instructions at the bottom can help with ssh key generation for your account.

---
#### Connecting

On the VM, there is an account created for common use to do the build/deploy: **`proc`**

Accounts on the VM:

* you
* others
* and shared build/deploy account: **`proc`**

You will be able to ssh into the VM with both a login id you provide, as well as the shared `proc` account.

**Purpose:**

A common build account saves space.

Every developer will not then need to clone and update the git project code.

Deployments of the app by `proc` account, will appear as:

  * `857911293348-compute@developer.gserviceaccount.com`
  
in the console:

  * https://console.firebase.google.com/project/mpi-dev-proc/hosting/sites/mpi-dev-proc

---
**You have the option of:**

1.  connecting, using your account/login, switching to the account `proc`, executing the build/deploy script
2.  or connecting directly as `proc` (once you get the private ssh key to copy to your local machine), and running the build/deploy script
3.  or running a script from your local machine that will invoke the remote build/deploy script (as user `proc`).  This script is provided below.

---
#### Example: ssh connect script

Put this in your path, create an alias to invoke, or whatever fits your workflow

**File: ssh-dev-proc**
```
#!/bin/bash
IP='35.227.161.39'
KEYFILE="$HOME/.ssh/id_ed25519_100_mpi_dev_proc1"   # <== or whatever you name the local private key file on your machine
REMOTE_USER='proc'    # or your login id
ssh -i $KEYFILE $REMOTE_USER@$IP
```

---
#### Build/Deploy script

You do not have to connect/login to the GCE VM to run the remote build/deploy script, as user **`proc`**

This script can be run on your local machine, to invoke the build/deploy:

**File:   deploy-fb**
```
#!/bin/bash

IP='35.227.161.39'
KEYFILE="$HOME/.ssh/id_ed25519_100_mpi_dev_proc1"   # <== or whatever you name the local keyfile
REMOTE_USER='proc'
SCRIPT='scl enable rh-nodejs10 "bash -l -c /home/proc/repos/mpi-proc-ang/deploy/firebase/deploy-fb"'

ssh -i $KEYFILE $REMOTE_USER@$IP -t $SCRIPT
```
You will be prompted twice for a ssh passphrase:

1. passphrase to ssh into 'mpi-dev-proc1' (from your local machine)
2. passphrase to: git pull origin master from bitbucket (ssh/git: from the GCE VM to Bitbucket)

 * You can setup/configure: `ssh-agent` on your local machine to bypass #1
 * I have not yet setup `ssh-agent` on `mpi-dev-proc1` to bypass #2

---
#### Please Use Responsibly:

Usage of the VM is on the honor system, please use responsibly for use with the project only.

If you happen to check any security log files, and notice any type of activity that might be questionable, please let us know.

This is a temporary method to build and deploy the project pending implementation of a **CI/CD** system and process.

**2FA** may shortly be implemented also.

---
#### What's on the VM?

**A: The usual stuff**

Everything is needed there to run a build and deploy with a single script.

If you need anything on the VM, any additional tools, libraries, please let me know.

I would like to stick with versions of build tools, languages available on **Software Collections**, for ease of software management, and library, runtime isolation.

---
#### CentOS Software Collections

`Software Collections (SCL)`, is a software repo that facilitates installation, maintenance and isolation of software on RHEL and CentOS instances.

After installing software using SCL the software will be present on the system, but not active. 

This means you can install multiple versions of any programming language for example, and enter a shell where only that version is active.

If you were to login, and look at the version of python it will be 2.7.x.
This is the version of Python that came with the base system, and will remain unchanged.

If you type:

  - `$scl enable rh-python36 bash`

You would be put into a bash shell where `python3` / `pip3` is active.

  - `$exit` will then exit, disabling python3/pip3, returning back to the base OS.

If you were to type:
```
$node --version
$npm --version
```
you would see neither are present on the system, because the base CentOS image did not come with node/npm pre-installed.

Using `Software Collections`, I installed latest version of node 10, but it has to be activated on a per session basis.

To enable node/npm, you will need to enter this:
  - `$scl enable rh-nodejs10 bash`

you can also put this line in your `.bash_profile` to enable automatically when you login.

**Benefits:**

If later versions of node come along (12.x), this will allow installation of node 12 on the machine, while retaining node 10, and using node 10 and it's modules, and libraries in isolation, not requiring removal of one version, replacement with another, and a global upgrade and testing effort of all projects. 

You can read more about `Software Collections` here:

* https://www.softwarecollections.org

---
#### RHEL

*`RHEL 7`* has the same model (RHEL Software Collection repos)

With *`RHEL 8`*, there is a new approach called: *`Application Streams`*, that may replace `Software Collections` 

* https://developers.redhat.com/blog/2018/11/15/rhel8-introducing-appstreams/
* https://en.wikipedia.org/wiki/Application_streaming

At some future point, I expect the upcoming *`CentOS 8`* and beyond, to adopt this model.

---
#### Production Deployment Options 

Production deployment may evolve depending on architectural needs, we have many more options than the ones below.

* **Firebase**

  * was fast and easy: https certs, domain name supplied, rich ecosystem integrating with other GCP offerings, and much  more to come, there are trade offs including vendor lock in.
  
* **AppEngine:**
  * yada, yada,...

* **Cloud Runner:** (New May 2019)

  * Build a container(s), deploy, can scale to zero, pay for only the compute you use. 
  * Cloud functions will be replaced by this eventually
  
* **Kubernetes / Pods**: running multiple RHEL 8 containers (RHEL 8 UBI)

  * https://www.redhat.com/en/blog/introducing-red-hat-universal-base-image
  * Industrial strength way to go
  * Highest level of customization options offered
  * can move to any cloud provider (no vendor lock in)

---
#### After you login

There is a shared build account on the VM, where the code is checked out:  **`proc`**

The account has a full environment setup for a build and deploy to firebase with a single script.

After switching to this user:
  * `$su - proc`

type:
  * `$deploy-ang-fb`

This is a script found in:   `/home/proc/bin/deploy-ang-fb`, that invokes other scripts.

---
#### Bitbucket

The build script:  `deploy-ang-fb` will do a `$git pull origin master` using ssh.

The .pub key file content has been uploaded as an `access key` to Bitbucket, not as a `user account key`, which is a git repo project wide key.

There is no user authentication to Bitbucket using this method.

* If you login as `proc`, take a look at: `/home/proc/.ssh/README.md`

During the build process, you will be prompted for the `ssh passphrase` to allow connecting from the VM to Bitbucket to pull new code (when `$git pull origin master` is invoked in the build script)

**Reference:**
  * https://confluence.atlassian.com/bitbucketserver/ssh-access-keys-for-system-use-776639781.html

---
#### Generating a .ssh key
(for your personal login only, all other keys mentioned here have been generated, and are in place)

Preferred algorithm: Ed25519

Please use a passphrase, even if simple.

`ssh-agent` can be configured to supply this passphrase for you when prompted, and to enable non-interactive scripting.

  - `$ssh-keygen -f <whatever-file-you-want> -o -a 100 -t ed25519 -C "-C comment optional"`

**Example:**

  - `$ssh-keygen -f id_ed25519_100_mpi_dev_proc1 -o -a 100 -t ed25519 -C "caleb@bustedwhistle.com Ed25519 100"`

---
#### Fix ssh permissions

Fix permissions, if needed your ssh keys/directories.

I put this script, in my .ssh directory, and run now and then, when needed (when all keys begin with **`id_`**):

**File: `fix-perms`**
```
#!/bin/bash
clear
chmod 700 $HOME/.ssh
chmod 600 $HOME/.ssh/id* $HOME/.ssh/authorized_keys
chmod 644 $HOME/.ssh/*.pub
chmod og-rwx $HOME $HOME/.ssh/*.md $HOME/.ssh/sav $HOME/.ssh/kgen $HOME/.ssh/fix-perms

ls -ld $HOME/.ssh
printf '\n----------'

ls -l $HOME/.ssh
```
---
#### More SSH Config Info

 * https://www.ssh.com/ssh
 * https://www.ssh.com/ssh/keygen
 * https://www.ssh.com/ssh/copy-id
 * https://www.ssh.com/ssh/agent
 * https://www.ssh.com/ssh/config
 * https://www.ssh.com/ssh/authorized_keys
 * https://nerderati.com/2011/03/17/simplify-your-life-with-an-ssh-config-file
 
---
#### Firebase deploys

Supposedly only new files that have changed will be sent to Firebase.

How it does this is speculative, but I imagine the following.

1.  On the first deploy, it goes through every local file and creates a local database or index of all files by hashing them.

2.  On each subsequent deploy, it cycles through every file again, computes the hash, compares with the previously stored hash, and only uploads the changes (deletes files, adds files, updates files that have been changed) 

This is efficient for a certain number of files, but we have hundreds of thousands.

We are working to get these into a database, so that there is only one hash on the DB, or multiple DB's which might not change often between deploys.

---
