import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { AuthService } from '../../../_services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit { PageLoading=true;
  loading = false;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  form: any = {
    ConfirmPassword: null,
    Email: null,
    Password: null
  };
  CustomerPlan = [];
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  mediaSub: Subscription;
  deviceXs: boolean;
  RegistrationForm: UntypedFormGroup;
  ApplicationRoleUserData = {
    ApplicationRoleUserId: 0,
    Active: 1,
    UserId: 0,
    RoleId: 0,
    PlanId: 0,
    ApplicationId: 0,
    CreatedDate: new Date(),
    UpdatedDate: new Date(),
    CreatedBy: 0,
    UpdatedBy: 0
  };
  constructor(private servicework: SwUpdate,
    private shareddata: SharedataService,
    private authService: AuthService,
    private fb: UntypedFormBuilder,
    private contentservice: ContentService,
    private route: Router,
    private dataservice: NaomitsuService,
    private mediaObserver: MediaObserver
  ) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    this.RegistrationForm = this.fb.group({
      UserName: ['', Validators.required],
      ContactNo: ['', Validators.required],
      OrganizationName: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(6)]],
      ConfirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    })
    // this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
    //   this.deviceXs = result.mqAlias === "xs" ? true : false;
    //   ////console.log("authlogin",this.deviceXs);
    // });
    this.shareddata.CurrentCustomerPlan.subscribe(p => this.CustomerPlan = p);
  }
  AgreementAccepted =false;
  AgreementText =`Software Services Agreement
  This Software Services Agreement, as of the date that You accept this Agreement (defined below) (“Effective Date”), is hereby entered into and agreed upon by you, either an individual or an entity (“You” or “Company”) and TTP. 
  BY ACCEPTING THIS AGREEMENT, EITHER BY INDICATING YOUR ACCEPTANCE, BY EXECUTING AN ORDER FORM THAT REFERENCES THIS AGREEMENT, OR BY UTILIZING THE SERVICES (DEFINED BELOW), YOU AGREE TO THIS AGREEMENT. THIS AGREEMENT IS A LEGALLY BINDING CONTRACT BETWEEN YOU AND TTP AND SETS FORTH THE TERMS THAT GOVERN THE LICENSE PROVIDED TO YOU HEREUNDER. IF YOU ARE ENTERING INTO THIS AGREEMENT ON BEHALF OF A COMPANY OR OTHER LEGAL ENTITY, YOU REPRESENT THAT YOU HAVE THE AUTHORITY TO BIND SUCH ENTITY TO THIS AGREEMENT. ANY CHANGES, ADDITIONS OR DELETIONS BY YOU TO THIS AGREEMENT WILL NOT BE ACCEPTED AND WILL NOT BE A PART OF THIS AGREEMENT. IF YOU DO NOT AGREE TO THIS AGREEMENT, YOU MUST NOT ACCESS, DOWNLOAD, INSTALL, OR USE THE SOFTWARE OR SERVICES. 
  TTP may modify this Agreement from time to time and will post the most up-to-date version on its website. Your continued use of the Services and Software following modification to the updated Agreement constitutes Your consent to be bound by the same. 
  1. DEFINITIONS.
   1.1 Affiliates means an entity controlled by, under common control with, or controlling such party, where control is denoted by having fifty percent (50%) or more of the voting power (or equivalent) of the applicable entity. Subject to the terms and conditions of this Agreement, Your Affiliates may use the license granted hereunder.
   1.2 Agreement means the Software Services Agreement, any applicable Product Addendum, the Data Processing Addendum, and the Order Form.
   1.3 Client(s) means, if You are an MSP, Your customer(s), if applicable.
   1.4 Data Processing Addendum(a) means the terms of the data processing addendum, which are incorporated herein by reference.
   1.5 Devices means (whether physical or virtual) a server, system, workstation, computer, mobile device, or end point upon which or through which the Services are used and/or on which the Software is installed.
   1.6 Documentation means the official user documentation prepared and provided by TTP to You on the use of the Services or Software (as updated from time to time). For the avoidance of doubt, any online community site, unofficial documentation, videos, white papers, or related media, or feedback do not constitute Documentation.
   1.7 MSP means a managed service provider.
   1.8 Order Form means the TTP order page, product information dashboard, or other TTP ordering document that specifies Your purchase of the Services, pricing, and other related information.
   1.9 Personal Data means any information that can be used to identify an individual as that term is defined under Regulation (EU) 2016/679 (“General Data Protection Regulation” or “GDPR”).
   1.10 Product Addendum(a) means additional terms and conditions set forth in Section 14 that relate to the applicable Services, Software, or Documentation.
   1.11 Services means the products and software services, including any application programming interface that accesses functionality, that are provided to You by TTP.
   1.12 Software means the object code versions of any downloadable software provided by TTP solely for the purpose of accessing the Services, including but not limited to an agent, together with the updates, new releases or versions, modifications or enhancements, owned and provided by TTP to You pursuant to this Agreement.
   1.13 Support means the standard maintenance or support provided by TTP or its designated agents as set forth in this Agreement if applicable to You.
   1.14 User means an individual authorized by You to use the Services, Software, and Documentation, for whom You have purchased a subscription or to whom You have supplied a user identification and password. User(s) may only include Your employees, consultants, and contractors, and if applicable, Your Clients.
   1.15 Your Data or Data means data, files, or information, including data, files, or information that include Personal Data, accessed, used, communicated, stored, or submitted by You or Your Users related to Your or Your User’s use of the Services or Software. 
  2. PROVISION OF SERVICES.
   2.1 Services License. 
  Upon payment of fees and subject to continuous compliance with this Agreement, TTP hereby grants You a limited, nonexclusive, non-transferable license to access, use, and install (if applicable) the Services, Software, and Documentation during the Term (defined below). You may provide, make available to, or permit Your Users to use or access the Services, the Software, or Documentation, in whole or in part. You agree that TTP may deliver the Services or Software to You with the assistance of its Affiliates, licensors, and service providers. During the Term (as defined herein), TTP may update or modify the Services or Software or provide alternative Services or Software to reflect changes in, among other things, laws, regulations, rules, technology, industry practices, patterns of system use, and availability of a third-party program. TTP’s updates or modifications to the Services or Software or provisions of alternative Services or Software will not materially reduce the level of performance, functionality, security, or availability of the Services or Software during the Term. 
  2.2 Evaluation or Beta License. 
  If the Services, Software, and Documentation are provided to You for evaluation, beta, or release candidate purposes, TTP grants to You a limited, nonexclusive, non-transferable evaluation license to use the Services, Software, and Documentation solely for evaluation prior to purchase or implementation (an “Evaluation License”). You shall not use the Evaluation License for production use. The Evaluation License shall terminate on the end date of the predetermined evaluation period or immediately upon notice from TTP in its sole discretion. Notwithstanding any other provision contained herein, the Services, Software, and Documentation provided pursuant to an Evaluation License are provided to You “AS IS” without indemnification, support, or warranty of any kind, express or implied. Except to the extent such terms conflict with this Section, all other terms of this Agreement shall apply to the Services, Software, and Documentation licensed under an Evaluation License.
   2.3 Upgrading/Downgrading Account Type. 
  If applicable to Your license, You may, at any time, upgrade or downgrade Your TTP account type. The change will take effect immediately. After an upgrade, You will be billed immediately for the additional fees due under the upgraded account type for the remaining time of the applicable Term. The amount due and owing for the upgraded account type will be reduced by the amount You have already paid for the applicable Term. After the Initial Term, You may downgrade, within the parameters communicated to You by TTP, upon thirty (30) days prior written notice to TTP. Any modification in the amount due to TTP will take effect after the thirty (30) day notice period, unless otherwise agreed upon by TTP. In regard to a downgraded account type, You will be billed the fees due for the downgraded account type at the commencement of the Renewal Term. Downgrading Your license may cause loss of content, features, or capacity as available to You under Your previous license, and TTP does not accept any liability for such loss. 
  3. LICENSE RESTRICTIONS; OBLIGATIONS.
   3.1 License Restrictions. You may not 
  (i) provide, make available to, or permit individuals other than Your Users to use or access the Services, the Software, or Documentation, in whole or in part; 
  (ii) copy, reproduce, republish, upload, post, or transmit the Services, Software, or Documentation (except for backup or archival purposes, which will not be used for transfer, distribution, sale, or installation on Your Devices); 
  (iii) license, sell, resell, rent, lease, transfer, distribute, or otherwise transfer rights to the Services, Software, or Documentation unless as authorized in this Agreement; 
  (iv) modify, translate, reverse engineer, decompile, disassemble, create derivative works, or otherwise attempt to derive the source code of the Services, Software, or Documentation; 
  (v) create, market, distribute add-ons or enhancements or incorporate into another product the Services or Software without prior written consent of TTP; 
  (vi) remove any proprietary notices or labels on the Services, Software, or Documentation, unless authorized by TTP; 
  (vii) use the Services or Software to store or transmit infringing, libelous, unlawful, or tortious material or to store or transmit material in violation of third party rights, including privacy rights; 
  (viii) use the Services or Software to violate any rights of others; 
  (ix) use the Services or Software to store or transmit malicious code, Trojan horses, malware, spam, viruses, or other destructive technology (“Viruses”); 
  (x) interfere with, impair, or disrupt the integrity or performance of the Services or any other third party’s use of the Services; 
  (xi) use the Services in a manner that results in excessive use, bandwidth, or storage; or 
  (xii) alter, circumvent, or provide the means to alter or circumvent the Services or Software, including technical limitations, recurring fees, or usage limits. 
  3.2 Your Obligations. You acknowledge, agree, and warrant that: 
  (i) You will be responsible for Your and Your Users’ activity and compliance with this Agreement, and if You become aware of any violation, You will immediately terminate the offending party’s access to the Services, Software, and   Documentation and notify TTP; 
  (ii) You and Your Users will comply with all applicable local, state, and international laws; 
  (iii) You will establish a constant internet connection and electrical supply for the use of the Services, ensure the Software is installed on a supported platform as set forth in the Documentation, and the Services and Software are used only with public domain or properly licensed third party materials; 
  (iv) You will install the latest version of the Software on Devices accessing or using the Services; 
  (v) You are legally able to process Your Data and are able to legally able to provide Your Data to TTP and its Affiliates, including obtaining appropriate consents or rights for such processing, as outlined further herein, and have the right to access and use Your infrastructure, including any system or network, to obtain or provide the Services and Software and will be solely responsible for the accuracy, security, quality, integrity, and legality of the same; and 
  (vi) You will keep your registration information, billing information, passwords and technical data accurate, complete, secure and current for as long as You subscribe to the Services, Software and Documentation. If You are an MSP, You further acknowledge, agree, and warrant that: 
  (i)	You have sufficient technical infrastructure, knowledge, and expertise to perform Your duties for Your Clients; 
  (ii)	You will provide all sales, problem resolution, and support services to Your Clients; 
  (iii)	You will be responsible for billing, invoicing, and collection for Your Clients; and 
  (iv)	You will operate at Your own expense and risk under Your own name as an MSP. 
  4. PROPRIETARY RIGHTS
   4.1 Ownership of TTP Intellectual Property. 
  The Services, Software, and Documentation are licensed, not sold. Use of “purchase” in conjunction with licenses of the Services, Software and Documentation shall not imply a transfer of ownership. Except for the limited rights expressly granted by TTP to You, You acknowledge and agree that all right, title and interest in and to all copyright, trademark, patent, trade secret, intellectual property (including without limitation algorithms, business processes, improvements, enhancements, modifications, derivative works, information collected and analyzed in connection with the Services) and other proprietary rights, arising out of or relating to the Services, the Software, the provision of the Services or Software, and the Documentation, belong exclusively to TTP or its suppliers or licensors. All rights, title, and interest in and to content, which may be accessed through the Services or the Software, is the property of the respective owner and may be protected by applicable intellectual property laws and treaties. This Agreement gives You no rights to such content, including use of the same. TTP is hereby granted a royalty-free, fully-paid, worldwide, exclusive, transferable, sub-licensable, irrevocable and perpetual license to use or incorporate into its products and services any information, data, suggestions, enhancement requests, recommendations or other feedback provided by You or Your Users relating to the Services or Software. All rights not expressly granted under this Agreement are reserved by TTP.
   4.2 Ownership of Your Data 
  You and Your Users retain all right, title, and interest in and to all copyright, trademark, patent, trade secret, intellectual property and other proprietary rights in and to Your Data. TTP’s right to access and use the same are limited to those expressly granted in this Agreement. No other rights with respect to Your Data are implied. 
  5. TERM; TERMINATION
   5.1 Term
  Unless terminated earlier in accordance with this Section, this Agreement will begin on the Effective Date and will continue until the end of the period specified in the applicable Order Form (the “Initial Term”). You authorize Worldwide to automatically renew the applicable Services upon the expiration of the Initial Term (each a Renewal Term, and collectively with the Initial Term, the Term). The Renewal Term will be the same length as the Initial Term unless otherwise specified by TTP at the time of renewal.
   5.2 Your Termination Rights 
  You may terminate the Agreement by providing TTP with thirty (30) days’ prior written notice of Your intention to terminate the Agreement. The thirty (30) day termination period will commence on the first day of the full calendar month after receipt of the termination notice. During the Initial Term, fees charged during the thirty (30) day notification period will be based upon the list price of the monthly contract value. During any Term, an early termination fee, based upon the list price of the monthly contract value, will also be applied to the final invoice and due upon receipt.
   5.3 TTP Suspension or Termination Rights
  TTP may suspend or terminate this Agreement upon thirty (30) days’ prior written notice or immediately if You become subject to bankruptcy or any other proceeding relating to insolvency, receivership, liquidation, or assignment for the benefit of creditors; You infringe or misappropriate TTP’s intellectual property; You breach this Agreement or Order Form, including failure to pay fees when due; or pursuant to the receipt of a subpoena, court order, or other request by a law enforcement agency.
   5.4 Effect of Termination 
  Termination shall not relieve You of the obligation to pay any fees or other amounts accrued or payable to TTP through the end of the current Term. You shall not receive a credit or refund for any fees or payments made prior to termination. Without prejudice to any other rights, upon termination, You must cease all use of the Services, Software, and Documentation and destroy or return (upon request by TTP) all copies of the Services, Software, and Documentation. You further acknowledge and agree that You will retrieve Your Data or copies of Your Data from TTP within five (5) business days of the termination of this Agreement. Unless in accordance with our internal policies, contractual, legal, or other obligation, You acknowledge and agree that TTP has the right to delete Your Data, including any and all copies thereof. Your Data, once deleted, will not be able to be recovered. Sections 1, 3, 4, 5.4, 6, 7, 9, 10, 11, 12, 13 and 14 shall survive any termination or expiration of this Agreement. 
  6. FEES AND PAYMENT; TAXES
   6.1 Fees and Payment. 
  All orders placed will be considered final upon acceptance by TTP. Fees will be due and payable as set forth on the Order Form. Unless otherwise set forth herein, fees shall be at TTP’s then-standard rates at the time of invoice or, if applicable, as set forth in the Order Form. If You fail to pay, TTP shall be entitled, at its sole discretion, to: 
  (i) suspend provision of the Services until You fulfil Your pending obligations; 
  (ii) charge You an interest rate designated by TTP at the time of invoice; and/or 
  (iii) terminate this Agreement. If applicable, if You exceed the license capacity designated, in addition to TTP’s other remedies, You will be charged additional fees, which will be reflected in Your invoice. Unless otherwise stated, all payments made under this Agreement shall be in Indian rupees. Fees are non-refundable. 
   6.2 Taxes. 
  All fees are exclusive of taxes, and You shall pay or reimburse TTP for all taxes arising out of transactions contemplated by this Agreement. If You are required to withhold any tax for payments due, You shall gross Your payments to TTP so that TTP receives sums due in full, free of any deductions. As reasonably requested, You will provide documentation to TTP showing that taxes have been paid to the relevant taxing authority. “Taxes” means any sales, VAT, use, and other taxes (other than taxes on TTP’s income), export and import fees, customs duties and similar charges imposed by any government or other authority. You hereby confirm that TTP can rely on the name and address that You provide to TTP when You agree to the fees or in connection with Your payment method as being the place of supply for sales tax and income tax purposes or as being the place of supply for VAT purposes where You have established Your business. 
  7. DATA; PROTECTION OF YOUR DATA 
    7.1 Your Data. TTP and its Affiliates may remove Your Data or any other data, information, or content of data or files used, stored, processed or otherwise by You or Your Users that TTP, in its sole discretion, believes to be or is: 
  (a) a Virus; 
  (b) illegal, libellous, abusive, threatening, harmful, vulgar, pornographic, or obscene; 
  (c) used for the purpose of spamming, chain letters, or dissemination of objectionable material; 
  (d) used to cause offense, defame or harass; or 
  (e) infringing the intellectual property rights or any other rights of any third party. You agree that You and Your Users are responsible for maintaining and protecting backups of Your Data directly or indirectly processed using the Services and Software and that TTP is not responsible for exportation of, the failure to store, the loss, or the corruption of Your Data. You agree that TTP and its Affiliates will process configuration, performance, usage, and consumption data about You and Your Users use of the Services and Software to assist with the necessary operation and function of the Services and Software and to improve TTP products and services and Your and Your Users’ experience with TTP and its Affiliates pursuant to the TTP Privacy Notice. You represent and warrant that You and Your Users, in regard to processing of Personal Data hereunder, You shall be deemed the data controller (and TTP, the data processor) and shall determine the purpose and manner in which such Personal Data is, or will be processed. 
    7.2 Protection of Your Data. 
  Each party shall comply with its respective obligations under applicable data protection laws. Each party shall maintain appropriate administrative, physical, technical and organizational measures that ensure an appropriate level of security for Confidential Information and Personal Data. TTP and its Affiliates will process Personal Data in accordance with the Data Processing Addendum. You are responsible for ensuring that the security of the Services is appropriate for Your intended use and the storage, hosting, or processing of Personal Data. 
  8. CONFIDENTIAL INFORMATION. 
  As used in this Agreement, Confidential Information means any non-public information or materials disclosed by either party to the other party, either directly or indirectly, in writing, orally, or by inspection of tangible objects that the disclosing party clearly identifies as confidential or proprietary. For clarity, Confidential Information includes Personal Data, and TTP Confidential Information includes the Services, Software, and any information or materials relating to the Services, Software (including pricing), or otherwise. Confidential Information may also include confidential or proprietary information disclosed to a disclosing party by a third party. The receiving party will: 
  (i)	hold the disclosing party’s Confidential Information in confidence and use reasonable care to protect the same; 
  (ii)	restrict disclosure of such Confidential Information to those employees or agents with a need to know such information and who are under a duty of confidentiality respecting the protection of Confidential Information substantially similar to those of this Agreement; and 
  (iii)	use Confidential Information only for the purposes for which it was disclosed, unless otherwise set forth herein. The restrictions will not apply to Confidential Information, excluding Personal Data, to the extent it 
  a.	is (or through no fault of the recipient, has become) generally available to the public; 
  b.	was lawfully received by the receiving party from a third party without such restrictions; 
  c.	was known to the receiving party without such restrictions prior to receipt from the disclosing party; or 
  d.	was independently developed by the receiving party without breach of this Agreement or access to or use of the Confidential Information. 
  The recipient may disclose Confidential Information to the extent the disclosure is required by law, regulation, or judicial order, provided that the receiving party will provide to the disclosing party prompt notice, where permitted, of such order and will take reasonable steps to contest or limit the steps of any required disclosure. The parties agree that any material breach of Section 3 or this Section 8 will cause irreparable injury and that injunctive relief in a court of competent jurisdiction will be appropriate to prevent an initial or continuing breach of these Sections in addition to any other relief to the applicable party may be entitled. 
  9. DISCLAIMER. 
  THE SERVICES, SOFTWARE, DOCUMENTATION, AND ALL OTHER PRODUCTS AND SERVICES PROVIDED HEREUNDER, INCLUDING THIRD PARTY HOSTED SERVICES, ARE PROVIDED ON “AS IS” AND “AS AVAILABLE” BASIS. TTP DISCLAIMS ALL REPRESENTATIONS AND WARRANTIES OF ANY KIND, EXPRESS, IMPLIED, OR STATUTORY, INCLUDING ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NONINFRINGEMENT, ACCURACY, RELIABILITY, SECURITY, LOSS OR CORRUPTION OF YOUR DATA, CONTINUITY, OR ABSENCE OF DEFECT RELATING TO THE SERVICES, SOFTWARE, DOCUMENTATION, ANY OTHER PRODUCT OR SERVICES, OR RESULTS OF THE SAME PROVIDED TO YOU UNDER THIS AGREEMENT. TTP DOES NOT WARRANT THAT THE SPECIFICATIONS OR FUNCTIONS CONTAINED IN THE SERVICES OR SOFTWARE WILL MEET YOUR REQUIREMENTS OR THAT DEFECTS IN THE SERVICES OR SOFTWARE WILL BE CORRECTED. EACH PARTY SPECIFICALLY DISCLAIMS RESPONSIBILITY OF THIRD-PARTY PRODUCTS AND SERVICES WITH WHICH YOU MAY UTILIZE THE SERVICES AND SOFTWARE, AND EACH PARTY SPECIFICALLY DISCLAIMS AND WAIVES ANY RIGHTS AND CLAIMS AGAINST THE OTHER PARTY WITH RESPECT TO SUCH THIRD-PARTY PRODUCTS AND SERVICES. 
  10. INDEMNIFICATION.
   10.1 TTP Indemnification. 
  TTP will indemnify, defend, and hold You harmless from any third-party claim brought against You that the Services, as provided by TTP, infringe or misappropriate any Indian patent, copyright, trademark, trade secret, or other intellectual property rights of a third party, provided 
  (i) use of the Services by You is in conformity with the Agreement and Documentation; 
  (ii) the infringement is not caused by modification or alteration of the Services; and/or 
  (iii) the infringement was not caused by a combination or use of the Services with products not supplied by TTP. 
  10.2 Your Indemnification. 
  You agree to indemnify, defend, and hold harmless TTP and its Affiliates, and its directors, employees, and agents from and against any claims arising out of or due to: 
  (i)	Your Data; 
  (ii)	Your (or Your User’s) breach of this Agreement; 
  (iii)	Your (or Your User’s) use of the Services, Software, or Documentation in violation of third-party rights, including any intellectual property or privacy rights, or any applicable laws; or 
  (iv)	Your (or Your User’s) misuse of the Services, Software, or Documentation. 
  11. LIMITATION OF LIABILITY. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, 
  (I) IN NO EVENT WILL TTP AND ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR AGENTS HAVE ANY LIABILITY, CONTINGENT OR OTHERWISE, FOR ANY INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, PUNITIVE, STATUTORY OR EXEMPLARY DAMAGES ARISING OUT OF OR RELATING TO THIS AGREEMENT, THE SERVICES, SOFTWARE, DOCUMENTATION, OR ANY OTHER PRODUCTS OR SERVICES PROVIDED HEREUNDER, INCLUDING, BUT NOT LIMITED TO LOST PROFITS, LOST OR CORRUPTED DATA, LOSS OF GOODWILL, WORK STOPPAGE, EQUIPMENT FAILURE OR MALFUNCTION, PROPERTY DAMAGE OR ANY OTHER DAMAGES OR LOSSES, EVEN IF A PARTY HAS BEEN ADVISED OF THE POSSIBILITY THEREOF, AND REGARDLESS OF THE LEGAL OR EQUITABLE THEORY (CONTRACT, TORT, STATUTE, INDEMNITY OR OTHERWISE) UPON WHICH ANY SUCH LIABILITY IS BASED; AND (II) THE AGGREGATE LIABILITY OF TTP AND ITS AFFILIATES, DIRECTORS, EMPLOYEES, AND AGENTS, AND THE SOLE REMEDY AVAILABLE TO YOU ARISING OUT OF OR RELATING TO THIS AGREEMENT, THE SERVICES, SOFTWARE, OR ANY PRODUCTS OR SERVICES PROVIDED HEREUNDER SHALL BE LIMITED TO TERMINATION OF THIS AGREEMENT AND DAMAGES NOT TO EXCEED THE TOTAL AMOUNT PAYABLE OR PAID TO TTP UNDER THIS AGREEMENT DURING THE TWELVE MONTHS PRIOR TO TERMINATION. 
  12. THIRD-PARTY PROGRAMS. 
  You may receive access to third-party programs through the Services or Software, or third-party programs may be bundled with the Services or Software. These third-party software programs are governed by their own license terms, which may include open source or free software licenses, and those terms will prevail over this Agreement as to Your use of the third-party programs. Nothing in this Agreement limits Your or Your Users’ rights under, or grants You or Your User rights that supersede, the terms of any such third-party program. 
  13. SUPPORT. 
  If applicable to You, TTP shall, during the Term, provide You with Support in accordance with the applicable support terms and conditions. You agree to: 
  (i)	promptly contact TTP with all problems with the Services or Software; and 
  (ii)	cooperate with and provide TTP with all relevant information and implement any corrective procedures that TTP requires to provide Support. TTP will have no obligation to provide Support for problems caused by or arising out of the following: 
  (i)	modifications or changes to the Software or Services; 
  (ii)	use of the Software or Services not in accordance with the Agreement or Documentation; or 
  (iii)	third-party products that are not authorized in the Documentation or, for authorized third-party products in the Documentation, problems arising solely from such third-party products. 
  
  14. GENERAL.
    14.1 Notices. 
  All notices must be sent via email to legal@ttpsolutions.in (with evidence of effective transmission). 
    14.2 Entire Agreement.
   This Agreement constitutes the entire agreement between the parties relating to the Services, Software, and Documentation provided hereunder and supersedes all prior or contemporaneous communications, agreements and understandings, written or oral, with respect to the subject matter hereof. If other TTP terms or conditions conflict with this Agreement, this Agreement shall prevail and control with respect to the Services, Software, and Documentation provided hereunder. In addition, any and all additional or conflicting terms provided by You, whether in a purchase order, an alternative license, or otherwise, shall be void and shall have no effect. 
   14.3 Export Control Laws. 
  The Services, Software, and Documentation delivered to You under this Agreement are subject to export control laws and regulations and may also be subject to import and export laws of the jurisdiction in which it was accessed, used, or obtained, if outside those jurisdictions. You shall abide by all applicable export control laws, rules, and regulations applicable to the Services, Software, and Documentation. You agree that You are not located in or are not under the control of or a resident of any country, person, or entity prohibited to receive the Services, Software, or Documentation due to export restrictions and that You will not export, re-export, transfer, or permit the use of the Services, Software, or Documentation, in whole or in part, to or in any of such countries or to any of such persons or entities. 
   14.4 Modifications. 
  Unless as otherwise set forth herein, this Agreement shall not be amended or modified by You except in writing signed by authorized representatives of each party. 
   14.5 Severability. 
  If any provision of this Agreement is held to be unenforceable, illegal, or void, that shall not affect the enforceability of the remaining provisions. The parties further agree that the unenforceable provision(s) shall be deemed replaced by a provision(s) that is binding and enforceable and that differs as little as possible from the unenforceable provision(s), with considerations of the object and purpose of this Agreement. 
   14.6 Waiver. 
  The delay or failure of either party to exercise any right provided in this Agreement shall not be deemed a waiver of that right. 
   14.7 Force Majeure.
     TTP will not be liable for any delay or failure to perform obligations under this Agreement due to any cause beyond its reasonable control, including acts of God; labor disputes; industrial disturbances; systematic electrical, telecommunications or other utility failures; earthquakes, storms, or other elements of nature; blockages; embargoes; riots; acts or orders of government; acts of terrorism; and war. 
  14.8 Construction. 
  Paragraph headings are for convenience and shall have no effect on interpretation. 
  14.9 Governing Law. 
  This Agreement shall be governed by the laws of India, without regard to any conflict of law provisions, except that the United Nations Convention on the International Sale of Goods and the provisions of the Uniform Computer Information Transactions Act shall not apply to this Agreement. You hereby consent to jurisdiction of India. If this Agreement is translated into a language other than English and there are conflicts between the translations of this Agreement, You agree that the English version of this Agreement shall prevail and control. 
  14.10 Third Party Rights. 
  Other than as expressly provided herein, this Agreement does not create any rights for any person who is not a party to it, and no person not a party to this Agreement may enforce any of its terms or rely on an exclusion or limitation contained in it. 
  14.11 Relationship of the Parties. The parties are independent contractors. This Agreement does not create a partnership, franchise, joint venture, agency, fiduciary, or employment relationship between the parties. 
  15. PRODUCT Backup Services Disclaimer. 
  IN ADDITION TO THE OTHER TERMS AND CONDITIONS HEREIN, YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT YOUR DATA MAY NOT BE AVAILABLE OR RESTORABLE IF 
  (1) YOU UTILIZE THE SERVICES IN EXCESS OF THE AMOUNT YOU ORDERED; 
  (2) A COPY OF YOUR DATA WAS NOT COMPLETED; 
  (3) YOU ATTEMPT TO BACK UP DEVICES, FILES, FOLDERS, OR DRIVES NOT SUPPORTED BY THE SERVICES AS SET FORTH IN THE DOCUMENTATION; 
  (4) YOU DESELECT OR DELETE A DEVICE, FILE, FOLDER, OR DRIVE FROM YOUR TTP ACCOUNT, FROM YOUR DEVICE, OR FROM BEING BACKED UP BY THE SERVICES; 
  (5) YOU MODIFY YOUR OPERATING SYSTEM IN A MANNER THAT BREAKS COMPATIBILITY OR INHIBITS THE FUNCTIONALITY OF THE SERVICES OR SOFTWARE; 
  (6) YOUR COMPUTER IS UNABLE TO ACCESS THE INTERNET OR TTP INFRASTRUCTURE; 
  (7) YOU FAIL TO COMPLY WITH THE AGREEMENT OR DOCUMENTATION; OR 
  (8) YOU TERMINATE OR FAIL TO RENEW YOUR SUBSCRIPTION TO THE SERVICES. IN WITNESS WHEREOF, each of the Parties hereto has executed this AGREEMENT by its duly authorized representatives on the respective date entered below. 
  ACCEPTED AND AGREED TO: TTP: `
  
  
  ;
  AcceptReject(event){
    this.AgreementAccepted= event.checked;
  }
  gotohome() {
    this.route.navigate(['/dashboard']);
  }
  gotologin() {
    this.route.navigate(['/auth/login']);
  }
  PageLoad() {

  }
  selectplan(){
    this.route.navigate(["/auth/selectplan"]);
  }
  AddAppUsers() {
    let orgToUpdate = {
      OrganizationName: this.RegistrationForm.get("OrganizationName").value,
      Active: 1
    }
    this.dataservice.postPatch('Organizations', orgToUpdate, 0, 'post')
      .subscribe(
        (organization: any) => {
          var today = new Date();
          let list: List = new List();
          list.fields = ["EmailAddress"];
          list.PageName = "AppUsers";
          list.filter = ["EmailAddress eq '" + this.RegistrationForm.get("Email").value + "' and Active eq 1"];
          let AppUsersData = {
            EmailAddress: this.RegistrationForm.get("Email").value,
            ContactNo: this.RegistrationForm.get("ContactNo").value,
            UserName: this.RegistrationForm.get("UserName").value,
            OrgId: organization.OrganizationId,
            CreatedDate: today,
            ValidFrom: today,
            ValidTo: today,// new Date(today.setDate(today.getMonth() + 1)),
            Active: 1
          }
          //debugger;
          this.dataservice.postPatch('AppUsers', AppUsersData, 0, 'post')
            .subscribe(
              (appuser: any) => {
                this.contentservice.openSnackBar("Congratulations! Your registration is successful.",globalconstants.ActionText,globalconstants.RedBackground);
                this.isSuccessful = true;
                this.isSignUpFailed = false;
              }, (error) => {
                //console.log('creating user error', error);

              });
        }, (error) => {
          //console.log('creating organization error', error);

        })

  }
  get f() { return this.RegistrationForm.controls; }

  onSave(): void {
    debugger;
    this.loading=true;
    this.errorMessage = '';
    const { UserName, ConfirmPassword, Email, Password, OrganizationName, ContactNo } = this.RegistrationForm.value;
    if(this.contentservice.checkSpecialChar(UserName))
    {
      this.loading=false;this.PageLoading=false;
      this.contentservice.openSnackBar("user name should not contains space or special characters.",globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    
    //debugger;
    var userDetail = {
      ConfirmPassword: ConfirmPassword,
      Email: Email,
      Password: Password,
      Username: UserName,
      OrganizationName: OrganizationName,
      ContactNo: ContactNo,
      RoleName:'Admin'
    }
    this.authService.CallAPI(userDetail,'Register').subscribe(
      data => {
        //this.AddAppUsers()
        this.contentservice.openSnackBar("Congratulations! Your registration is successful.",  globalconstants.ActionText,globalconstants.BlueBackground);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        this.loading=false;this.PageLoading=false;
      },
      err => {
        var modelState;
        if (err.error.ModelState != null)
          modelState = JSON.parse(JSON.stringify(err.error.ModelState));
        else if (err.error != null)
          modelState = JSON.parse(JSON.stringify(err.error));
        else
          modelState = JSON.parse(JSON.stringify(err));

        //THE CODE BLOCK below IS IMPORTANT WHEN EXTRACTING MODEL STATE IN JQUERY/JAVASCRIPT
        for (var key in modelState) {
          if (modelState.hasOwnProperty(key) && key.toLowerCase() == 'errors') {
            for(var key1 in modelState[key])
            this.errorMessage += (this.errorMessage == "" ? "" : this.errorMessage + "<br/>") + modelState[key][key1];
            //errors.push(modelState[key]);//list of error messages in an array
          }
        }
        this.contentservice.openSnackBar(this.errorMessage,globalconstants.ActionText,globalconstants.RedBackground);
        this.isSignUpFailed = true;
        this.loading=false;this.PageLoading=false;
        //console.log(err.error)
      }
    );
  }
}