---
title: "How I Fixed Hibernate on My NixOS Machine"
date: 2024-05-27
canonicalURL: https://haseebmajid.dev/posts/2024-05-27-how-i-fixed-hibernation-on-my-nixos-machine
tags:
  - hibernate
  - drivers
  - nixos
cover:
  image: images/cover.png
---


{{< notice type="info" title="tl:dr;" >}}
Wi-Fi drivers were stopping the PC from suspending. I am using an Ethernet cable to connect my PC. So didn't need the
Wi-Fi drivers. By adding them to a blocklist. I think you only need the 2nd one in the list.

```nix
{
    boot.blacklistedKernelModules = [
      "ath12k_pci"
      "ath12k"
    ];
}
```
{{< /notice >}}


Recently, I upgraded my PC to an am5 machine with an X670E Gigabyte motherboard. However, when I did this hibernate
was left broken, alongside suspend. This gave me an idea, it wasn't to do with my hibernate setup being broken by something
else going on.

So I started debugging, looking at the systemd logs which we can use `journalctl` service. Specifically, the `journal -f`
command to tail all the logs. Then in another terminal I ran `systemctl hibernate`

```bash
Apr 22 06:06:53 workstation kernel: ath12k_pci 0000:0f:00.0: failed to suspend core: -95
 22 06:06:53 workstation kernel: ath12k_pci 0000:0f:00.0: PM: pci_pm_freeze(): ath12k_pci_pm_suspend+0x0/0x50 [ath12k] returns -95
 22 06:06:53 workstation kernel: ath12k_pci 0000:0f:00.0: PM: dpm_run_callback(): pci_pm_freeze+0x0/0xc0 returns -95
 22 06:06:53 workstation kernel: ath12k_pci 0000:0f:00.0: PM: failed to freeze async: error -95
 22 06:06:53 workstation kernel: nvme nvme1: Shutdown timeout set to 10 seconds
 22 06:06:53 workstation kernel: nvme nvme1: 8/0/0 default/read/poll queues
 22 06:06:53 workstation kernel: nvme nvme1: Ignoring bogus Namespace Identifiers
 22 06:06:53 workstation kernel: PM: hibernation: Basic memory bitmaps freed
 22 06:06:53 workstation kernel: OOM killer enabled.
 22 06:06:53 workstation kernel: Restarting tasks ... done.
 22 06:06:53 workstation kernel: PM: hibernation: hibernation exit
 22 06:06:53 workstation systemd-sleep[11861]: Failed to put system to sleep. System resumed again: Operation not supported
 22 06:06:53 workstation systemd[1]: systemd-hibernate.service: Main process exited, code=exited, status=1/FAILURE
 22 06:06:53 workstation systemd[1]: systemd-hibernate.service: Failed with result 'exit-code'.
 22 06:06:53 workstation systemd[1]: Failed to start System Hibernate.
 22 06:06:53 workstation systemd[1]: Dependency failed for System Hibernation.
 22 06:06:53 workstation systemd[1]: hibernate.target: Job hibernate.target/start failed with result 'dependency'.
```

These logs provide us with a bunch of useful information, we can see that the hibernate job failed.

```bash
 22 06:06:53 workstation kernel: PM: hibernation: Basic memory bitmaps freed
 22 06:06:53 workstation kernel: OOM killer enabled.
 22 06:06:53 workstation kernel: Restarting tasks ... done.
 22 06:06:53 workstation kernel: PM: hibernation: hibernation exit
 22 06:06:53 workstation systemd-sleep[11861]: Failed to put system to sleep. System resumed again: Operation not supported
 22 06:06:53 workstation systemd[1]: systemd-hibernate.service: Main process exited, code=exited, status=1/FAILURE
 22 06:06:53 workstation systemd[1]: systemd-hibernate.service: Failed with result 'exit-code'.
 22 06:06:53 workstation systemd[1]: Failed to start System Hibernate.
 22 06:06:53 workstation systemd[1]: Dependency failed for System Hibernation.
 22 06:06:53 workstation systemd[1]: hibernate.target: Job hibernate.target/start failed with result 'dependency'.
```

However, I could not find an exact reason within the job itself. After trying numerous random things, I looked closer
at the logs above and noticed the mention of the Wi-Fi drivers `ath12k_pci` failing to suspend.

```bash
Apr 22 06:06:53 workstation kernel: ath12k_pci 0000:0f:00.0: failed to suspend core: -95
 22 06:06:53 workstation kernel: ath12k_pci 0000:0f:00.0: PM: pci_pm_freeze(): ath12k_pci_pm_suspend+0x0/0x50 [ath12k] returns -95
 22 06:06:53 workstation kernel: ath12k_pci 0000:0f:00.0: PM: dpm_run_callback(): pci_pm_freeze+0x0/0xc0 returns -95
 22 06:06:53 workstation kernel: ath12k_pci 0000:0f:00.0: PM: failed to freeze async: error -95
```

This then gave me the idea to try to add the drivers to the blocklist and see if that resolves the issue. Like so:


```nix
{
    boot.blacklistedKernelModules = [
      "ath12k_pci"
      "ath12k"
    ];
}
```

That's it! Hibernate and suspend are now working. Of course, the downside now for my desktop I cannot use the Wi-Fi
built into my motherboard. But that's an issue for another day, currently I have it connected via an Ethernet cable.
