# Firebase Build/Deploy - mpi-proc-ang

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
  
  
* gcp project:    mpi-proc-dev
* vm name:        mpi-proc-dev1
* Region:         us-west
* Zone:           us-west-b
* Specs:          4 vCPU, 7.5 GB, 100 GB SSD, preemptible
* IP:             35.pending
    
---
#### Getting access to the VM

* Send me a preferred login id
* You can send me a ssh .pub key file or upload once you login.

Instructions at the bottom can help with ssh key generation.

---
#### Connecting

Accounts on the VM:
* you
* others
* and account: `proc`

You will be able to ssh with a login id you provide.

On the VM, there is another account created for common use to do the build/deploy **(`proc`)**

**Purpose:** This saves space, since every developer will not then need to clone and update the git project code.

---

**You have the option of:**
* connecting using your account, switching to the user `proc`, executing the build/deploy script
* or connecting directly as `proc` (once you get the private ssh key to copy to your local machine)
* or running a script from your local machine that will invoke the remote build/deploy script (as user `proc`)

---
#### Example: ssh connect script

Put this in your path, or create an alias to invoke.

```
#!/bin/bash
IP='35.227.161.39'
KEYFILE="$HOME/.ssh/id_ed25519_100_mpi_dev_proc1"
REMOTE_USER='proc'    # or your login id
ssh -i $KEYFILE $REMOTE_USER@$IP

# ssh -i ~/.ssh/id_ed25519_100_mpi_dev_proc1 proc@$IP
```

You do not have to connect/login to the GCE VM to run the remote build/deploy script

Just put the above script on your local machine, and add the path to the remote build/deploy script to the end of the ssh command. 

`<ssh command> "/path/to/gce/vm/angular/build/firebase/deploy/script arg1 arg2 ..."`

---
Usage of the VM is on the honor system, please use responsibly for use with the project only.

If you happen to check any security log files, and notice any type of activity that might be questionable, please let us know.

This is a temporary method to build and deploy the project pending implementation of a CI/CD system and process.

2FA may shortly be implemented also.

---
#### What's on the VM?

A: The usual stuff

Everything is needed there to run a build and deploy with a single script.

If you need anything on the VM, any additional tools, libraries, please let me know.

I would like to stick with versions of build tools available on Software Collections.

---
#### CentOS Software Collections

When you login, your `.bash_profile` will run a few commands to put you into another shell.

If you were to type `$exit`, you would still be at a command prompt.

`Software Collections (scl)`, is a repo used with CentOS to allow installation of software on the VM, or any CentOS instance, but not have the software active.

This means you can install multiple versions of any programming language for example, and enter a shell where that version is active.

If you were to login, type: `$exit`, and look at the version of python it will be 2.7.x.
This is the version of Python that came with the base system, and will remain unchanged.

If you were to type:  `$scl enable python3.6 bash`
You would be put into a bash shell where `Python3` / `pip3` is active.

If you were to type:
```
$node --version
$npm --version
```

, you would see neither are present on the system, because the base CentOS image did not come with node pre-installed.

With `Software Collections` the latest version of node 10 was installed, but not made active.  There is a line in your `.bash_profile` that will activate it.

**Benefits:**

If later versions of node come along (12.x), this will allow installation of node 12 on the machine, while retaining node 10, and using node 10 and it's modules, and libraries, not requiring a global upgrade or conflicthing

You can read more about `Software Collections` here:
* https://www.softwarecollections.org

---
#### RHEL

`RHEL 7` has the same model (RHEL Software Collection repos)

With `RHEL 8`, there is a new model `Application Streams`, that will come later.

* https://developers.redhat.com/blog/2018/11/15/rhel8-introducing-appstreams/
* https://en.wikipedia.org/wiki/Application_streaming

At some future point, I expect the upcoming `CentOS 8` and beyond, to adopt this model as well.

---
#### Production Deployment Options 

Production deployment may evolve depending on architectural needs, we have many more options than the ones below.

* **Firebase**
  * was fast and easy: https certs, domain name supplied, rich ecosystem integrating with other GCP offerings, and much  more to come, there are trade offs including vendor lock in.
* **AppEngine:**  
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

Shared build account on VM:  `proc`

On the VM, there is a shared user `proc` that has a full environment setup for a build and deploy to firebase with a single script.

After switching to this user:
  * `$su - proc`

type:
  * `$deploy-ang-fb`

This is a script found in:   `/home/proc/bin/deploy-ang-fb`, that invokes other scripts.

---
#### Bitbucket

The build script:  `deploy-ang-fb` will do a `$git pull origin master` using ssh.

The keys used can be found in `/home/proc/.ssh/`

The .pub key has been uploaded as an access key to Bitbucket, not as a user key, but as a git repo project wide key.

There is no user authentication to Bitbucket.

* https://confluence.atlassian.com/bitbucketserver/ssh-access-keys-for-system-use-776639781.html

---
#### Generating a .ssh key

Preferred: Ed25519, use a pass phrase

`$ssh-keygen -f <whatever-file-you-want> -o -a 100 -t ed25519 -C "-C comment optional"`

**Example:**

`$ssh-keygen -f id_ed25519_100_mpi_dev_proc1 -o -a 100 -t ed25519 -C "caleb@bustedwhistle.com Ed25519 100"`

---
#### Fix ssh permissions

Fix permissions, if needed your ssh keys/directories.

I put this in my .ssh directory, and run now and then, when needed (when all keys begin with **`id_`**):
```
#!/bin/bash

# Set correct permissions on .ssh artifacts
chmod 700 $HOME/.ssh
chmod 600 $HOME/.ssh/id*
chmod 644 $HOME/.ssh/id*.pub
chmod og-rwx $HOME
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

On the first deploy, it goes through every local file and creates a local database or index of all files by hashing them.

On each subsequent deploy, it cycles through every file again, computes the hash, compares with the previously stored hash, and only uploads the changes (deletes files, adds files, updates files that have been changed) 

This is efficient for a certain number of files, but we have hundreds of thousands.

We are working to get these into a database, so that there is only one hash on the DB, or multiple DB's which might not change often between deploys.

---

possibly more later
