import { CourseTree, FileType } from '@/types';

export const MOCK_CATALOG: Record<string, CourseTree> = {
  'cybersecurity-fundamentals': {
    courseSlug: 'cybersecurity-fundamentals',
    courseTitle: 'Cybersecurity Basics – Foundation Notes',
    rootFolderId: '1Drf74G5L-CPzvikrW54Cuq6SawAcynva',
    totalFiles: 14,
    isMock: true,
    stats: { videos: 4, pdfs: 5, labs: 2, docs: 3, others: 0 },
    rootFiles: [
      {
        id: 'fund-intro-pdf',
        name: '00 - Cybersecurity Fundamentals Syllabus & Objectives.pdf',
        mimeType: 'application/pdf',
        size: 2450000,
        formattedSize: '2.3 MB',
        modifiedTime: '2026-08-10T14:30:00Z',
        fileType: 'pdf',
        description: 'Course roadmap, prerequisite check, learning targets, and certification alignment.',
      },
      {
        id: 'fund-quickstart-md',
        name: 'README - Foundation Notes Overview.md',
        mimeType: 'text/markdown',
        size: 15400,
        formattedSize: '15.4 KB',
        modifiedTime: '2026-08-12T09:15:00Z',
        fileType: 'markdown',
        description: 'Orientation guide explaining how to study OSI layers, network sniffing, and cipher suites.',
        sampleContent: `# Cybersecurity Basics: Foundational Architecture

Welcome to the **Cybersecurity Fundamentals Track**. This course establishes the technical bedrock required for both offensive penetration testing and defensive threat response.

---

## 1. The Core Triad: Confidentiality, Integrity, Availability (CIA)
- **Confidentiality:** Preventing unauthorized disclosure (AES-256, TLS 1.3, Access Control Lists).
- **Integrity:** Ensuring data is unaltered in transit and storage (SHA-256, HMAC, digital signatures).
- **Availability:** Guaranteeing systems remain reachable (DDoS mitigation, load balancing, redundancy).

---

## 2. Networking Under the Microscope (OSI vs. TCP/IP)
Every cybersecurity exploit operates on network protocol mechanics. Understanding packet construction is mandatory:

\`\`\`bash
# Inspect your local network interfaces and routing table
ip -c addr show
ip route show

# Capture 10 ICMP packets to analyze header structures
sudo tcpdump -i eth0 -nn -c 10 icmp
\`\`\`

### TCP 3-Way Handshake
1. **Client -> Server:** \`SYN\` (Initial Sequence Number: ISN_c)
2. **Server -> Client:** \`SYN-ACK\` (ACK = ISN_c + 1, ISN_s)
3. **Client -> Server:** \`ACK\` (ACK = ISN_s + 1)

---

## 3. Cryptography Essentials
- **Symmetric:** AES (GCM/CBC), ChaCha20. Same key encrypts & decrypts. Fast, suited for bulk payloads.
- **Asymmetric:** RSA, ECC (Curve25519). Public key encrypts, private key decrypts. Used for key exchange and authentication.
- **Diffie-Hellman Key Exchange:** Enables two parties to establish a shared secret over an insecure channel.

> [!NOTE]
> Ensure you complete all module exercises and download the networking lab capture below before moving to Ethical Hacking.
`,
      },
    ],
    modules: [
      {
        id: 'fund-mod-1',
        name: 'Module 01: Computer Networking & Architecture',
        files: [
          {
            id: 'fund-video-1',
            name: '1.1 Deep Dive: OSI 7-Layer Model & Real-World Packet Flows.mp4',
            mimeType: 'video/mp4',
            size: 145000000,
            formattedSize: '138 MB',
            duration: '24:18',
            modifiedTime: '2026-08-15T11:00:00Z',
            fileType: 'video',
            description: 'Visual breakdown tracing an HTTP/3 request from Application layer down to Physical signals.',
          },
          {
            id: 'fund-video-2',
            name: '1.2 TCP vs UDP, Handshakes, and Port Multiplexing.mp4',
            mimeType: 'video/mp4',
            size: 182000000,
            formattedSize: '173 MB',
            duration: '31:45',
            modifiedTime: '2026-08-16T15:20:00Z',
            fileType: 'video',
            description: 'Socket anatomy, sequence numbers, window scaling, and how port exhaustion occurs.',
          },
          {
            id: 'fund-pdf-1',
            name: 'TCP-IP Protocols & Header Specifications Reference.pdf',
            mimeType: 'application/pdf',
            size: 4200000,
            formattedSize: '4.0 MB',
            modifiedTime: '2026-08-18T10:00:00Z',
            fileType: 'pdf',
            description: 'Diagrams and byte offsets for IPv4, IPv6, TCP, UDP, and ICMP headers.',
          },
          {
            id: 'fund-lab-1',
            name: 'Lab-01-Packet-Analysis-Pcap-Samples.zip',
            mimeType: 'application/zip',
            size: 18500000,
            formattedSize: '17.6 MB',
            modifiedTime: '2026-08-20T16:45:00Z',
            fileType: 'lab',
            description: 'Real Wireshark .pcap captures containing ARP spoofing, DNS exfiltration, and cleartext FTP creds.',
          },
        ],
      },
      {
        id: 'fund-mod-2',
        name: 'Module 02: Cryptography & Public Key Infrastructure (PKI)',
        files: [
          {
            id: 'fund-video-3',
            name: '2.1 Cryptographic Primitives: Hashing, Ciphers, and MACs.mp4',
            mimeType: 'video/mp4',
            size: 210000000,
            formattedSize: '200 MB',
            duration: '28:10',
            modifiedTime: '2026-08-22T13:00:00Z',
            fileType: 'video',
            description: 'Why MD5/SHA1 are deprecated, rainbow table attacks, salt & peppers, and PBKDF2/Argon2.',
          },
          {
            id: 'fund-pdf-2',
            name: 'Applied Cryptography & TLS 1.3 Deep Dive Handbook.pdf',
            mimeType: 'application/pdf',
            size: 8900000,
            formattedSize: '8.5 MB',
            modifiedTime: '2026-08-25T17:10:00Z',
            fileType: 'pdf',
            description: 'Complete breakdown of TLS handshakes, certificate authorities, revocation (CRLs/OCSP), and cipher suites.',
          },
          {
            id: 'fund-doc-1',
            name: 'OpenSSL CLI Cheatsheet - Key Generation & Cert Signing.md',
            mimeType: 'text/markdown',
            size: 18200,
            formattedSize: '18.2 KB',
            modifiedTime: '2026-08-26T12:00:00Z',
            fileType: 'markdown',
            description: 'Command lines to generate self-signed certificates, inspect x509 certs, and verify chains.',
            sampleContent: `# OpenSSL Hands-on Cheatsheet

Inspect, generate, and verify cryptographic certificates directly from your terminal:

\`\`\`bash
# 1. Generate a 2048-bit RSA Private Key with AES encryption
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -aes256 -out private.key

# 2. Generate a modern ECC Private Key (Curve25519)
openssl genpkey -algorithm ED25519 -out ed25519_private.key

# 3. Create a Certificate Signing Request (CSR)
openssl req -new -key private.key -out request.csr -subj "/C=US/ST=Security/O=CyberLearn/CN=cyberlearn.internal"

# 4. Inspect an active TLS certificate on a live domain
openssl s_client -connect google.com:443 -showcerts </dev/null 2>/dev/null | openssl x509 -text -noout | grep -E "Issuer|Subject|Not After"
\`\`\`
`,
          },
        ],
      },
      {
        id: 'fund-mod-3',
        name: 'Module 03: Linux & Windows Security Internals',
        files: [
          {
            id: 'fund-video-4',
            name: '3.1 Linux File Permissions, SUID Bits, and Capabilities.mp4',
            mimeType: 'video/mp4',
            size: 195000000,
            formattedSize: '186 MB',
            duration: '35:12',
            modifiedTime: '2026-08-28T14:40:00Z',
            fileType: 'video',
            description: 'Linux permission model, sticky bits, sudoers configuration, and PAM authentication.',
          },
          {
            id: 'fund-pdf-3',
            name: 'Windows Architecture & Access Tokens Guide.pdf',
            mimeType: 'application/pdf',
            size: 6100000,
            formattedSize: '5.8 MB',
            modifiedTime: '2026-08-30T09:00:00Z',
            fileType: 'pdf',
            description: 'Security Identifiers (SIDs), Discretionary Access Control Lists (DACLs), and LSASS token handling.',
          },
          {
            id: 'fund-lab-2',
            name: 'Lab-02-Privilege-Escalation-Scenarios.zip',
            mimeType: 'application/zip',
            size: 45000000,
            formattedSize: '42.9 MB',
            modifiedTime: '2026-09-01T18:00:00Z',
            fileType: 'lab',
            description: 'Preconfigured vulnerable cron jobs, wildcards, and misconfigured sudo policies.',
          },
        ],
      },
    ],
  },

  'learn-ethical-hacking': {
    courseSlug: 'learn-ethical-hacking',
    courseTitle: 'Learn Ethical Hacking from Scratch',
    rootFolderId: '1if6MCeBCj8sxWwJIKhtgwU0GBuBW8uLx',
    totalFiles: 18,
    isMock: true,
    stats: { videos: 7, pdfs: 5, labs: 3, docs: 3, others: 0 },
    rootFiles: [
      {
        id: 'hacking-course-overview',
        name: '00 - Ethical Hacking Lab Setup & Legal Guidelines.pdf',
        mimeType: 'application/pdf',
        size: 3800000,
        formattedSize: '3.6 MB',
        modifiedTime: '2026-07-15T10:00:00Z',
        fileType: 'pdf',
        description: 'Rules of Engagement, non-disclosure agreements, legal frameworks (CFAA, Computer Misuse Act).',
      },
      {
        id: 'hacking-lab-env',
        name: 'Lab-Setup-Kali-Linux-and-Metasploitable3.md',
        mimeType: 'text/markdown',
        size: 19800,
        formattedSize: '19.8 KB',
        modifiedTime: '2026-07-18T14:20:00Z',
        fileType: 'markdown',
        description: 'Step-by-step instructions for hosting isolated host-only virtualization subnets.',
        sampleContent: `# Ethical Hacking Lab Architecture

To practice safely without touching production networks, configure an isolated virtualization sandbox using VirtualBox or VMware.

---

## Network Topology
- **Attacker Box:** Kali Linux 2026.x (IP: \`192.168.56.10/24\`)
- **Target 1:** Metasploitable 3 Windows (IP: \`192.168.56.20/24\`)
- **Target 2:** Metasploitable 3 Ubuntu (IP: \`192.168.56.30/24\`)
- **Adapter:** Host-Only Network (\`vboxnet0\`) with DHCP disabled.

\`\`\`bash
# Test connectivity to target
ping -c 3 192.168.56.20

# Run a stealth SYN scan with service and OS detection
nmap -sS -sV -O -p- --min-rate 1000 -T4 192.168.56.20 -oN initial_scan.txt
\`\`\`
`,
      },
    ],
    modules: [
      {
        id: 'hack-mod-1',
        name: 'Module 01: Information Gathering & Reconnaissance',
        files: [
          {
            id: 'hack-vid-1',
            name: '1.1 Passive Reconnaissance: OSINT, Shodan, and Subfinder.mp4',
            mimeType: 'video/mp4',
            size: 240000000,
            formattedSize: '228 MB',
            duration: '38:40',
            modifiedTime: '2026-07-20T11:00:00Z',
            fileType: 'video',
            description: 'Harvesting DNS records, certificate transparency logs, ASN mapping, and historical archive discovery.',
          },
          {
            id: 'hack-vid-2',
            name: '1.2 Active Reconnaissance: Nmap Scripting Engine (NSE) Mastery.mp4',
            mimeType: 'video/mp4',
            size: 290000000,
            formattedSize: '276 MB',
            duration: '44:15',
            modifiedTime: '2026-07-22T16:00:00Z',
            fileType: 'video',
            description: 'Advanced Nmap flags, crafting custom scripts, firewall evasion, and fragmented packet scans.',
          },
          {
            id: 'hack-pdf-1',
            name: 'Nmap & Active Enumeration Playbook.pdf',
            mimeType: 'application/pdf',
            size: 5100000,
            formattedSize: '4.9 MB',
            modifiedTime: '2026-07-24T12:00:00Z',
            fileType: 'pdf',
            description: 'Cheat sheet covering SMB enumeration, SNMP walking, RPC interrogation, and LDAP querying.',
          },
        ],
      },
      {
        id: 'hack-mod-2',
        name: 'Module 02: Web Application Vulnerabilities & Exploitation',
        files: [
          {
            id: 'hack-vid-3',
            name: '2.1 SQL Injection: Error-Based, Blind, and Time-Based Exploits.mp4',
            mimeType: 'video/mp4',
            size: 320000000,
            formattedSize: '305 MB',
            duration: '52:10',
            modifiedTime: '2026-07-26T14:30:00Z',
            fileType: 'video',
            description: 'Extracting schemas, dumping hashes, bypass WAF filters, and gaining remote command execution via xp_cmdshell.',
          },
          {
            id: 'hack-vid-4',
            name: '2.2 Cross-Site Scripting (XSS) & CSRF Token Bypass.mp4',
            mimeType: 'video/mp4',
            size: 210000000,
            formattedSize: '200 MB',
            duration: '36:45',
            modifiedTime: '2026-07-28T09:20:00Z',
            fileType: 'video',
            description: 'DOM XSS, session hijacking, cookie exfiltration, and modern SameSite cookie policies.',
          },
          {
            id: 'hack-pdf-2',
            name: 'OWASP Top 10 Deep Dive Guidebook.pdf',
            mimeType: 'application/pdf',
            size: 7800000,
            formattedSize: '7.4 MB',
            modifiedTime: '2026-07-30T15:10:00Z',
            fileType: 'pdf',
            description: 'Broken access control, cryptographic failures, injection, SSRF, and security misconfigurations.',
          },
          {
            id: 'hack-lab-1',
            name: 'Lab-Vulnerable-Web-App-Docker-Compose.zip',
            mimeType: 'application/zip',
            size: 34000000,
            formattedSize: '32.4 MB',
            modifiedTime: '2026-08-01T17:00:00Z',
            fileType: 'lab',
            description: 'Spin up 5 vulnerable test microservices locally with one `docker-compose up` command.',
          },
        ],
      },
      {
        id: 'hack-mod-3',
        name: 'Module 03: Exploitation Frameworks & Metasploit',
        files: [
          {
            id: 'hack-vid-5',
            name: '3.1 Metasploit Framework: Architecture, Stagers, and Meterpreter.mp4',
            mimeType: 'video/mp4',
            size: 275000000,
            formattedSize: '262 MB',
            duration: '41:30',
            modifiedTime: '2026-08-03T11:00:00Z',
            fileType: 'video',
            description: 'Payload generation with msfvenom, multi-handler configuration, staged vs stageless payloads.',
          },
          {
            id: 'hack-vid-6',
            name: '3.2 Post-Exploitation: Pivoting through Compromised Hosts.mp4',
            mimeType: 'video/mp4',
            size: 310000000,
            formattedSize: '295 MB',
            duration: '48:15',
            modifiedTime: '2026-08-05T13:40:00Z',
            fileType: 'video',
            description: 'SSH dynamic port forwarding, chisel socks proxies, proxychains, and routing through meterpreter sessions.',
          },
          {
            id: 'hack-doc-2',
            name: 'Pivoting and Tunneling Master Reference.md',
            mimeType: 'text/markdown',
            size: 21500,
            formattedSize: '21.5 KB',
            modifiedTime: '2026-08-07T16:00:00Z',
            fileType: 'markdown',
            description: 'Complete synthesis of SSH, Chisel, Ligolo-ng, and Plink proxy commands.',
            sampleContent: `# Pivoting & Tunneling Quick Reference

When an internal host has no internet access, route your traffic through an exploited dual-homed machine:

### 1. SSH Dynamic SOCKS5 Proxy
\`\`\`bash
# Open local port 1080 tunneling through compromised pivot host
ssh -D 1080 -f -N -C user@192.168.1.50

# Route scans through /etc/proxychains4.conf
proxychains nmap -sT -Pn -p 80,443,445 10.10.10.15
\`\`\`

### 2. Modern Tunneling with Ligolo-ng
Ligolo-ng creates a genuine TUN interface on your attacker machine without proxychains overhead:

\`\`\`bash
# On Kali:
sudo ip tuntap add user $(whoami) mode tun ligolo
sudo ip link set ligolo up
./proxy -autocert

# On Target:
./agent.exe -connect 192.168.1.100:11601 -ignore-cert
\`\`\`
`,
          },
        ],
      },
    ],
  },

  'ceh-study-materials': {
    courseSlug: 'ceh-study-materials',
    courseTitle: 'CEH Study Materials',
    rootFolderId: '1Vgdtm5l9PEnHUU-g8caa3PjaZEMJltQ5',
    totalFiles: 12,
    isMock: true,
    stats: { videos: 0, pdfs: 9, labs: 1, docs: 2, others: 0 },
    rootFiles: [
      {
        id: 'ceh-mat-syllabus',
        name: 'CEH v12 Official Exam Blueprint & Objectives.pdf',
        mimeType: 'application/pdf',
        size: 3400000,
        formattedSize: '3.2 MB',
        modifiedTime: '2026-06-10T10:00:00Z',
        fileType: 'pdf',
        description: 'Covers the 20 official CEH v12 domains, scoring criteria, and question distributions.',
      },
    ],
    modules: [
      {
        id: 'ceh-mat-mod1',
        name: 'Official Courseware Volumes',
        files: [
          {
            id: 'ceh-book-vol1',
            name: 'EC-Council CEH v12 Volume 1 - Modules 01 to 05.pdf',
            mimeType: 'application/pdf',
            size: 42000000,
            formattedSize: '40.0 MB',
            modifiedTime: '2026-06-12T12:00:00Z',
            fileType: 'pdf',
            description: 'Introduction to Ethical Hacking, Footprinting, Scanning, Enumeration, Vulnerability Analysis.',
          },
          {
            id: 'ceh-book-vol2',
            name: 'EC-Council CEH v12 Volume 2 - Modules 06 to 10.pdf',
            mimeType: 'application/pdf',
            size: 48000000,
            formattedSize: '45.7 MB',
            modifiedTime: '2026-06-14T14:30:00Z',
            fileType: 'pdf',
            description: 'System Hacking, Malware Threats, Sniffing, Social Engineering, Denial-of-Service.',
          },
          {
            id: 'ceh-book-vol3',
            name: 'EC-Council CEH v12 Volume 3 - Modules 11 to 15.pdf',
            mimeType: 'application/pdf',
            size: 39000000,
            formattedSize: '37.1 MB',
            modifiedTime: '2026-06-16T16:00:00Z',
            fileType: 'pdf',
            description: 'Session Hijacking, Evading IDS/Firewalls/Honeypots, Hacking Web Servers, Web Applications, SQL Injection.',
          },
          {
            id: 'ceh-book-vol4',
            name: 'EC-Council CEH v12 Volume 4 - Modules 16 to 20.pdf',
            mimeType: 'application/pdf',
            size: 44000000,
            formattedSize: '41.9 MB',
            modifiedTime: '2026-06-18T18:15:00Z',
            fileType: 'pdf',
            description: 'Wireless Hacking, Mobile Platforms, IoT/OT Hacking, Cloud Computing Security, Cryptography.',
          },
        ],
      },
      {
        id: 'ceh-mat-mod2',
        name: 'Exam Cram Guides & Summary Sheets',
        files: [
          {
            id: 'ceh-cram-1',
            name: 'CEH v12 All-in-One Exam Cram Review.pdf',
            mimeType: 'application/pdf',
            size: 14500000,
            formattedSize: '13.8 MB',
            modifiedTime: '2026-06-20T11:00:00Z',
            fileType: 'pdf',
            description: 'Condensed 250-page revision guide highlighting high-probability test questions and definitions.',
          },
          {
            id: 'ceh-cram-2',
            name: 'CEH Port Numbers and Protocols Quick Reference.pdf',
            mimeType: 'application/pdf',
            size: 1200000,
            formattedSize: '1.1 MB',
            modifiedTime: '2026-06-22T09:30:00Z',
            fileType: 'pdf',
            description: 'Table of all standardized IANA ports commonly tested on CEH examinations.',
          },
        ],
      },
    ],
  },

  'ceh-video-lectures': {
    courseSlug: 'ceh-video-lectures',
    courseTitle: 'CEH Video Lectures',
    rootFolderId: '1YdnlgS_1QRhXidJQHd2V3SpuO7G0Ywv7',
    totalFiles: 10,
    isMock: true,
    stats: { videos: 8, pdfs: 1, labs: 0, docs: 1, others: 0 },
    rootFiles: [],
    modules: [
      {
        id: 'ceh-vid-mod1',
        name: 'Section 1: Scanning & Enumeration',
        files: [
          {
            id: 'ceh-lec-1',
            name: '01 - Scanning Networks: Three-Way Handshake & FIN Scans.mp4',
            mimeType: 'video/mp4',
            size: 215000000,
            formattedSize: '205 MB',
            duration: '32:10',
            modifiedTime: '2026-05-10T10:00:00Z',
            fileType: 'video',
            description: 'Packet flags, NULL scans, XMAS scans, and how stateful firewalls handle invalid flag combos.',
          },
          {
            id: 'ceh-lec-2',
            name: '02 - NetBIOS, SNMP, and LDAP Enumeration Tools.mp4',
            mimeType: 'video/mp4',
            size: 198000000,
            formattedSize: '188 MB',
            duration: '29:45',
            modifiedTime: '2026-05-12T13:20:00Z',
            fileType: 'video',
            description: 'Querying SNMP MIB trees with snmpwalk, nbtstat enumeration, and Active Directory user extraction.',
          },
        ],
      },
      {
        id: 'ceh-vid-mod2',
        name: 'Section 2: System Hacking & Malware',
        files: [
          {
            id: 'ceh-lec-3',
            name: '03 - Password Cracking Techniques: Rainbow Tables & Hashcat.mp4',
            mimeType: 'video/mp4',
            size: 245000000,
            formattedSize: '233 MB',
            duration: '36:15',
            modifiedTime: '2026-05-14T11:00:00Z',
            fileType: 'video',
            description: 'Benchmarking GPU hash cracking, rule-based mutations, and NT hash cracking.',
          },
          {
            id: 'ceh-lec-4',
            name: '04 - Malware Anatomy: Trojans, Polymorphic Viruses, and Rootkits.mp4',
            mimeType: 'video/mp4',
            size: 230000000,
            formattedSize: '219 MB',
            duration: '34:50',
            modifiedTime: '2026-05-16T15:30:00Z',
            fileType: 'video',
            description: 'Static vs dynamic malware analysis, sandboxing with Cuckoo, and analyzing PE headers.',
          },
        ],
      },
      {
        id: 'ceh-vid-mod3',
        name: 'Section 3: Web & Cloud Security',
        files: [
          {
            id: 'ceh-lec-5',
            name: '05 - Sniffers, ARP Poisoning & Man-in-the-Middle Attacks.mp4',
            mimeType: 'video/mp4',
            size: 260000000,
            formattedSize: '247 MB',
            duration: '39:20',
            modifiedTime: '2026-05-18T12:00:00Z',
            fileType: 'video',
            description: 'Using Ettercap/Bettercap for ARP cache poisoning and SSL stripping.',
          },
          {
            id: 'ceh-lec-6',
            name: '06 - Cloud Computing Threats & AWS IAM Privilege Escalation.mp4',
            mimeType: 'video/mp4',
            size: 285000000,
            formattedSize: '271 MB',
            duration: '42:15',
            modifiedTime: '2026-05-20T16:45:00Z',
            fileType: 'video',
            description: 'Misconfigured S3 bucket enumeration, metadata service (IMDSv1 vs IMDSv2) attacks.',
          },
        ],
      },
    ],
  },

  'ceh-notes': {
    courseSlug: 'ceh-notes',
    courseTitle: 'CEH Notes',
    rootFolderId: '1bkMeKQ8PfYKrKmnl-evVj3h36caS9BIY',
    totalFiles: 8,
    isMock: true,
    stats: { videos: 0, pdfs: 4, labs: 0, docs: 4, others: 0 },
    rootFiles: [
      {
        id: 'ceh-notes-master',
        name: 'CEH-v12-Comprehensive-Review-Notes.md',
        mimeType: 'text/markdown',
        size: 34000,
        formattedSize: '34.0 KB',
        modifiedTime: '2026-06-01T10:00:00Z',
        fileType: 'markdown',
        description: 'Complete synthesis of definitions, formulas, and tool syntax required for the CEH exam.',
        sampleContent: `# CEH v12 Complete Review Notes

## Key Formulas & Laws
- **ALE (Annualized Loss Expectancy):** \`ALE = SLE x ARO\`
  - \`SLE (Single Loss Expectancy) = Asset Value x Exposure Factor (EF)\`
  - \`ARO (Annualized Rate of Occurrence):\` Frequency per year.
- **Risk Calculation:** \`Risk = Threat x Vulnerability x Impact\`
- **Common Port Cheat Sheet:**
  - Port 53: DNS (UDP for lookups, TCP for zone transfers)
  - Port 88: Kerberos
  - Port 135: MS RPC Endpoint Mapper
  - Port 139 / 445: NetBIOS-SSN / SMB
  - Port 389 / 636: LDAP / LDAPS
  - Port 1433: Microsoft SQL Server
  - Port 1521: Oracle Database
  - Port 3389: RDP
`,
      },
    ],
    modules: [
      {
        id: 'ceh-notes-mod1',
        name: 'Topic Summary Sheets',
        files: [
          {
            id: 'ceh-note-pdf-1',
            name: 'CEH Module 03 - Network Scanning Cheat Sheet.pdf',
            mimeType: 'application/pdf',
            size: 2100000,
            formattedSize: '2.0 MB',
            modifiedTime: '2026-06-03T11:00:00Z',
            fileType: 'pdf',
            description: 'Summary of Nmap flags, hping3 syntax, and firewall evasion switches.',
          },
          {
            id: 'ceh-note-pdf-2',
            name: 'CEH Module 06 - System Hacking & Hash Cracking.pdf',
            mimeType: 'application/pdf',
            size: 2800000,
            formattedSize: '2.6 MB',
            modifiedTime: '2026-06-05T14:00:00Z',
            fileType: 'pdf',
            description: 'SAM database extraction, mimikatz commands, and pass-the-hash procedures.',
          },
        ],
      },
    ],
  },

  'ceh-labs': {
    courseSlug: 'ceh-labs',
    courseTitle: 'CEH Labs',
    rootFolderId: '17aTgWGoJRaTC7TxstXEX-3zewVgy_YjS',
    totalFiles: 10,
    isMock: true,
    stats: { videos: 1, pdfs: 4, labs: 4, docs: 1, others: 0 },
    rootFiles: [],
    modules: [
      {
        id: 'ceh-lab-mod1',
        name: 'Lab Manuals & Exercise Workbooks',
        files: [
          {
            id: 'ceh-lab-manual-1',
            name: 'CEH v12 Official Lab Manual - Vol 1 (Scanning & Recon).pdf',
            mimeType: 'application/pdf',
            size: 18000000,
            formattedSize: '17.1 MB',
            modifiedTime: '2026-05-25T10:00:00Z',
            fileType: 'pdf',
            description: 'Step-by-step instructions for completing reconnaissance and scanning assignments.',
          },
          {
            id: 'ceh-lab-manual-2',
            name: 'CEH v12 Official Lab Manual - Vol 2 (System Attacks).pdf',
            mimeType: 'application/pdf',
            size: 22000000,
            formattedSize: '20.9 MB',
            modifiedTime: '2026-05-28T14:30:00Z',
            fileType: 'pdf',
            description: 'Privilege escalation, steganography, trojans, and Wireshark traffic inspection walkthroughs.',
          },
        ],
      },
      {
        id: 'ceh-lab-mod2',
        name: 'Virtual Machine Images & Lab Packages',
        files: [
          {
            id: 'ceh-ova-target',
            name: 'CEH-v12-Target-Windows-Lab-Environment.ova',
            mimeType: 'application/x-virtualbox-ova',
            size: 2450000000,
            formattedSize: '2.28 GB',
            modifiedTime: '2026-05-30T16:00:00Z',
            fileType: 'lab',
            description: 'Pre-configured vulnerable Windows Server 2019 instance for Active Directory and SMB attacks.',
          },
          {
            id: 'ceh-lab-scripts',
            name: 'CEH-Hands-On-Automation-Scripts.zip',
            mimeType: 'application/zip',
            size: 12500000,
            formattedSize: '11.9 MB',
            modifiedTime: '2026-06-02T18:00:00Z',
            fileType: 'lab',
            description: 'Python and Bash scripts used in the automated vulnerability verification modules.',
          },
        ],
      },
    ],
  },

  'ceh-practical-resources': {
    courseSlug: 'ceh-practical-resources',
    courseTitle: 'CEH Practical Resources',
    rootFolderId: '17aTgWGoJRaTC7TxstXEX-3zewVgy_YjS',
    totalFiles: 7,
    isMock: true,
    stats: { videos: 0, pdfs: 3, labs: 3, docs: 1, others: 0 },
    rootFiles: [],
    modules: [
      {
        id: 'ceh-prac-mod1',
        name: 'CEH Practical Exam Prep',
        files: [
          {
            id: 'ceh-prac-guide',
            name: 'CEH Practical Exam Blueprint & 20-Challenge Walkthrough.pdf',
            mimeType: 'application/pdf',
            size: 9200000,
            formattedSize: '8.7 MB',
            modifiedTime: '2026-06-15T10:00:00Z',
            fileType: 'pdf',
            description: 'How to tackle the 6-hour hands-on CEH Practical examination with speed and precision.',
          },
          {
            id: 'ceh-prac-pack',
            name: 'CEH-Practical-Simulated-Network-Challenges.zip',
            mimeType: 'application/zip',
            size: 85000000,
            formattedSize: '81.0 MB',
            modifiedTime: '2026-06-18T13:45:00Z',
            fileType: 'lab',
            description: 'Offline challenge scenarios mimicking the real exam questions (Nmap, SQLMap, John the Ripper).',
          },
        ],
      },
    ],
  },

  'red-team-resources': {
    courseSlug: 'red-team-resources',
    courseTitle: 'Red Team Resources',
    rootFolderId: '1uFt09G20WAskczk4Mk1U0OqW8N2COsZ5',
    totalFiles: 15,
    isMock: true,
    stats: { videos: 2, pdfs: 6, labs: 4, docs: 3, others: 0 },
    rootFiles: [
      {
        id: 'rt-ops-framework',
        name: 'Red Team Operations Framework & TTP Execution.pdf',
        mimeType: 'application/pdf',
        size: 7400000,
        formattedSize: '7.0 MB',
        modifiedTime: '2026-07-01T09:00:00Z',
        fileType: 'pdf',
        description: 'Adversary emulation methodology aligned with MITRE ATT&CK and Lockheed Martin Cyber Kill Chain.',
      },
    ],
    modules: [
      {
        id: 'rt-mod-c2',
        name: 'Command & Control (C2) Infrastructures',
        files: [
          {
            id: 'rt-c2-guide',
            name: 'Modern C2 Frameworks Architecture Guide (Mythic, Sliver, Havoc).pdf',
            mimeType: 'application/pdf',
            size: 11200000,
            formattedSize: '10.6 MB',
            modifiedTime: '2026-07-05T11:00:00Z',
            fileType: 'pdf',
            description: 'Deploying redundant redirectors, CDN fronting, DNS beacons, and egress filtering evasion.',
          },
          {
            id: 'rt-c2-lab',
            name: 'Sliver-C2-Multiplayer-Docker-Deployment.zip',
            mimeType: 'application/zip',
            size: 28000000,
            formattedSize: '26.7 MB',
            modifiedTime: '2026-07-08T15:30:00Z',
            fileType: 'lab',
            description: 'Docker compose file for standing up a secure Sliver C2 server with Mutual TLS authentication.',
          },
        ],
      },
      {
        id: 'rt-mod-ad',
        name: 'Active Directory Attacks & Domain Dominance',
        files: [
          {
            id: 'rt-ad-pdf',
            name: 'Active Directory Exploitation: Kerberoasting, AS-REP & DCSync.pdf',
            mimeType: 'application/pdf',
            size: 8900000,
            formattedSize: '8.4 MB',
            modifiedTime: '2026-07-12T14:00:00Z',
            fileType: 'pdf',
            description: 'BloodHound analysis, abusing unconstrained delegation, Golden & Silver tickets.',
          },
          {
            id: 'rt-ad-notes',
            name: 'BloodHound-Cypher-Queries-CheatSheet.md',
            mimeType: 'text/markdown',
            size: 14200,
            formattedSize: '14.2 KB',
            modifiedTime: '2026-07-15T18:00:00Z',
            fileType: 'markdown',
            description: 'Handcrafted Cypher queries to find shortest paths to Domain Admin and unrolled group memberships.',
          },
        ],
      },
    ],
  },

  'offsec-resources': {
    courseSlug: 'offsec-resources',
    courseTitle: 'OffSec Resources',
    rootFolderId: '1ySTW2ZEuPPTqKD_-SPY9VHxb2wQeUb2D',
    totalFiles: 14,
    isMock: true,
    stats: { videos: 3, pdfs: 5, labs: 3, docs: 3, others: 0 },
    rootFiles: [
      {
        id: 'offsec-pwk-guide',
        name: 'Penetration Testing with Kali Linux (PWK) Methodology.pdf',
        mimeType: 'application/pdf',
        size: 16500000,
        formattedSize: '15.7 MB',
        modifiedTime: '2026-06-25T10:00:00Z',
        fileType: 'pdf',
        description: 'The definitive OSCP preparation guide: report writing, proof.txt extraction, and methodical enumeration.',
      },
    ],
    modules: [
      {
        id: 'offsec-bof',
        name: 'Module 01: 32-bit & 64-bit Buffer Overflows',
        files: [
          {
            id: 'offsec-bof-pdf',
            name: 'Stack-Based Buffer Overflow Step-by-Step Manual.pdf',
            mimeType: 'application/pdf',
            size: 6800000,
            formattedSize: '6.4 MB',
            modifiedTime: '2026-06-28T12:00:00Z',
            fileType: 'pdf',
            description: 'Spiking, fuzzing, finding the offset, locating bad characters, and finding JMP ESP instructions in Immunity Debugger.',
          },
          {
            id: 'offsec-bof-lab',
            name: 'Buffer-Overflow-Vulnerable-Server-Practice-Binaries.zip',
            mimeType: 'application/zip',
            size: 9800000,
            formattedSize: '9.3 MB',
            modifiedTime: '2026-07-02T15:20:00Z',
            fileType: 'lab',
            description: 'Vulnerable Windows x86 services for testing exploitation scripts without ASLR/DEP.',
          },
        ],
      },
      {
        id: 'offsec-privesc',
        name: 'Module 02: Linux & Windows Privilege Escalation',
        files: [
          {
            id: 'offsec-privesc-linux',
            name: 'Linux Privilege Escalation for OSCP Candidates.pdf',
            mimeType: 'application/pdf',
            size: 7900000,
            formattedSize: '7.5 MB',
            modifiedTime: '2026-07-06T14:10:00Z',
            fileType: 'pdf',
            description: 'Kernel exploits, dirty cow, unquoted service paths, always install elevated, and seImpersonatePrivilege potato exploits.',
          },
          {
            id: 'offsec-privesc-cheatsheet',
            name: 'OSCP-Exam-Checklist-and-Commands.md',
            mimeType: 'text/markdown',
            size: 26000,
            formattedSize: '26.0 KB',
            modifiedTime: '2026-07-10T19:00:00Z',
            fileType: 'markdown',
            description: 'Emergency OSCP command synthesis for rapid terminal reference under exam time constraints.',
          },
        ],
      },
    ],
  },

  'blue-team-kit': {
    courseSlug: 'blue-team-kit',
    courseTitle: 'Blue Team Kit – Books',
    rootFolderId: '1v4dQsqYe6ekjgaoImDuU0CcEJKymx1Vs',
    totalFiles: 11,
    isMock: true,
    stats: { videos: 0, pdfs: 8, labs: 1, docs: 2, others: 0 },
    rootFiles: [
      {
        id: 'bt-handbook',
        name: 'Blue Team Handbook: Incident Response Edition.pdf',
        mimeType: 'application/pdf',
        size: 12400000,
        formattedSize: '11.8 MB',
        modifiedTime: '2026-05-15T09:00:00Z',
        fileType: 'pdf',
        description: 'Standard operational field manual for incident responders, SOC analysts, and cybersecurity defenders.',
      },
    ],
    modules: [
      {
        id: 'bt-forensics',
        name: 'Digital Forensics & Memory Analysis',
        files: [
          {
            id: 'bt-volatility-pdf',
            name: 'Memory Forensics with Volatility 3: Analyzing RAM Captures.pdf',
            mimeType: 'application/pdf',
            size: 14200000,
            formattedSize: '13.5 MB',
            modifiedTime: '2026-05-18T11:30:00Z',
            fileType: 'pdf',
            description: 'Finding injected DLLs, process hollowing, extraction of credentials from memory dumps.',
          },
          {
            id: 'bt-win-artifacts',
            name: 'Windows Forensic Analysis: Prefetch, Shimcache, and Event Logs.pdf',
            mimeType: 'application/pdf',
            size: 9800000,
            formattedSize: '9.3 MB',
            modifiedTime: '2026-05-22T15:00:00Z',
            fileType: 'pdf',
            description: 'Timeline creation, investigating persistence in Run keys, scheduled tasks, and WMI event consumers.',
          },
          {
            id: 'bt-forensic-lab',
            name: 'Ransomware-Memory-Dump-Challenge.zip',
            mimeType: 'application/zip',
            size: 145000000,
            formattedSize: '138 MB',
            modifiedTime: '2026-05-26T17:15:00Z',
            fileType: 'lab',
            description: 'Raw .raw RAM capture of a machine infected with LockBit ransomware for forensic triage.',
          },
        ],
      },
    ],
  },

  'soc-resources': {
    courseSlug: 'soc-resources',
    courseTitle: 'SOC Resources',
    rootFolderId: '1bz7uOtUy7cO87tBNewnFzDy1nRgwO7Gl',
    totalFiles: 13,
    isMock: true,
    stats: { videos: 1, pdfs: 6, labs: 2, docs: 4, others: 0 },
    rootFiles: [
      {
        id: 'soc-analyst-roadmap',
        name: 'SOC Analyst Tier 1-3 Career Guide & Detection Engineering.pdf',
        mimeType: 'application/pdf',
        size: 8500000,
        formattedSize: '8.1 MB',
        modifiedTime: '2026-06-05T10:00:00Z',
        fileType: 'pdf',
        description: 'Triage methodologies, mean time to detect (MTTD), mean time to respond (MTTR), and playbook workflows.',
      },
    ],
    modules: [
      {
        id: 'soc-siem',
        name: 'SIEM & Detection Engineering',
        files: [
          {
            id: 'soc-splunk-guide',
            name: 'Splunk Enterprise Security & Advanced SPL Queries Guide.pdf',
            mimeType: 'application/pdf',
            size: 11000000,
            formattedSize: '10.5 MB',
            modifiedTime: '2026-06-08T12:00:00Z',
            fileType: 'pdf',
            description: 'Building correlation searches, stats/eval syntax, threshold alerts, and threat intelligence ingestion.',
          },
          {
            id: 'soc-sigma-yara',
            name: 'Writing Sigma Rules & YARA Signatures for Enterprise Defense.md',
            mimeType: 'text/markdown',
            size: 17500,
            formattedSize: '17.5 KB',
            modifiedTime: '2026-06-12T14:30:00Z',
            fileType: 'markdown',
            description: 'Convert threat intelligence reports into actionable Sigma detection rules for any SIEM.',
            sampleContent: `# Enterprise Detection Engineering: Sigma & YARA

## 1. Detecting PowerShell Encoded Command Execution (Sigma)
\`\`\`yaml
title: Suspicious Base64 Encoded PowerShell Execution
id: f48b5327-0b1a-4d32-9cb9-00918efbc752
status: production
description: Detects base64 encoded command arguments commonly used to bypass command-line inspection
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        Image|endswith:
            - '\\powershell.exe'
            - '\\pwsh.exe'
        CommandLine|contains:
            - ' -e '
            - ' -enc '
            - ' -encodedcommand '
    condition: selection
falsepositives:
    - Administrative SCCM software installations
level: high
tags:
    - attack.execution
    - attack.t1059.001
\`\`\`
`,
          },
          {
            id: 'soc-pcap-lab',
            name: 'SOC-Alert-Triage-Challenge-PCAP.zip',
            mimeType: 'application/zip',
            size: 38000000,
            formattedSize: '36.2 MB',
            modifiedTime: '2026-06-15T16:00:00Z',
            fileType: 'lab',
            description: 'Network packet capture containing Cobalt Strike beaconing and suspicious PowerShell downloads.',
          },
        ],
      },
    ],
  },
};
