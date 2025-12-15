export type Language = "en" | "zh";

export const translations = {
  home: {
    title: {
      en: "QR Lost & Found",
      zh: "扫码找回失物",
    },
    subtitle: {
      en: "Never lose your valuables again. Smart QR codes that help reunite you with your items",
      zh: "再也不用担心丢失贵重物品。智能二维码，帮助您找回遗失的物品",
    },
    login: {
      en: "Login / Sign Up",
      zh: "登录 / 注册",
    },
    scan: {
      en: "Scan QR Code",
      zh: "扫描二维码",
    },
  },
  homeAbout: {
    title: {
      en: "How It Works",
      zh: "使用方式",
    },
    subtitle1: {
      en: "Register",
      zh: "注册",
    },
    description1: {
      en: "Attach a QR code to your item and register it with your account",
      zh: "将二维码贴在物品上，并在账户中完成注册",
    },
    subtitle2: {
      en: "Scan",
      zh: "扫描",
    },
    description2: {
      en: "If someone finds your item, they simply scan the QR code with their phone camera",
      zh: "如果有人捡到您的物品，只需用手机摄像头扫描二维码",
    },
    subtitle3: {
      en: "Reunite",
      zh: "找回物品",
    },
    description3: {
      en: "Get notified and pick up your item from a secure drop-off location",
      zh: "收到通知，并在安全的交接地点取回物品",
    },
  },
  features: {
    title: {
      en: "Features",
      zh: "功能",
    },
    privacyProtected: {
      en: "Privacy Protected",
      zh: "隐私保护",
    },
    privacyProtectedDescription: {
      en: "Your contact details stay hidden",
      zh: "联系方式受到保护，不对外公开",
    },
    secureDropoffs: {
      en: "Secure Drop-offs",
      zh: "安全交接点",
    },
    secureDropoffsDescription: {
      en: "Partner locations like libraries and police stations hold items safely",
      zh: "合作地点（如图书馆、警察局等）可安全保管遗失物品",
    },
    instantNotifications: {
      en: "Instant Notifications",
      zh: "即时通知",
    },
    instantNotificationsDescription: {
      en: "Get notified immediately when your item is found and dropped off",
      zh: "当物品被找到并送达后，立即收到通知",
    },
    sevenDayPickup: {
      en: "7-Day Pickup Window",
      zh: "7 天取期",
    },
    sevenDayPickupDescription: {
      en: "Items are held securely for 7 days at partner locations",
      zh: "物品将在合作地点安全保管 7 天",
    },
  },
  auth: {
    signInTitle: {
      en: "Sign in to your account",
      zh: "登录您的账户",
    },
    dashboardAccess: {
      en: "Access your QR Lost & Found dashboard",
      zh: "访问您的二维码失物招领管理后台",
    },
    emailAddress: {
      en: "Email Address",
      zh: "邮箱",
    },
    enterEmail: {
      en: "Enter your email address",
      zh: "请输入您的电子邮箱",
    },
    password: {
      en: "Password",
      zh: "密码",
    },
    enterPassword: {
      en: "Enter your password",
      zh: "请输入您的密码",
    },
    forgotPassword: {
      en: "Forgot your password?",
      zh: "忘记密码？",
    },
    signIn: {
      en: "Sign in",
      zh: "登录",
    },
    noAccount: {
      en: "Don't have an account?",
      zh: "还没有账户？",
    },
    createAccount: {
      en: "Create one here",
      zh: "点击这里注册",
    },
    emailPasswordRequired: {
      en: "Please enter both email and password",
      zh: "请输入邮箱和密码",
    },
  },
  scan: {
    title: {
      en: "Scan QR Code",
      zh: "扫描二维码",
    },
    subtitle: {
      en: "Point your camera at a QR code to scan it",
      zh: "将摄像头对准二维码进行扫描",
    },
    readyToScan: {
      en: "Ready to Scan",
      zh: "准备扫描",
    },
    cameraPermission: {
      en: "We'll need access to your camera to scan QR codes.",
      zh: "需要获取您的摄像头权限以扫描二维码。",
    },
    startScanning: {
      en: "Start Scanning",
      zh: "开始扫描",
    },
    tipsTitle: {
      en: "Tips for Scanning",
      zh: "扫描小提示",
    },
    tipWellLit: {
      en: "Make sure the QR code is well-lit",
      zh: "确保二维码光线充足",
    },
    tipHoldSteady: {
      en: "Hold your phone steady",
      zh: "请保持手机稳定",
    },
    tipKeepInFrame: {
      en: "Keep the QR code within the frame",
      zh: "将二维码保持在框内",
    },
    tipAvoidReflections: {
      en: "Avoid reflections on glossy surfaces",
      zh: "避免光滑表面的反光",
    },
    tipManualEntry: {
      en: "If scanning fails, try entering the code manually",
      zh: "如果扫描失败，可尝试手动输入编码",
    },
    enterManually: {
      en: "Enter Code Manually",
      zh: "手动输入编码",
    },
    backToHome: {
      en: "Back to Home",
      zh: "返回首页",
    },
    cameraAccessNeeded: {
      en: "Camera Access Needed",
      zh: "需要摄像头权限",
    },
    tryAgain: {
      en: "Try Again",
      zh: "重新尝试",
    },
    stopScanning: {
      en: "Stop Scanning",
      zh: "停止扫描",
    },
    positionQR: {
      en: "Position the QR code within the frame",
      zh: "将二维码放置在框内",
    },
    compatibilityNotice: {
      en: "Camera access works on modern browsers (Chrome, Safari, Edge, Firefox). Make sure to allow camera permissions when prompted.",
      zh: "摄像头功能支持现代浏览器（Chrome、Safari、Edge、Firefox）。请在提示时允许摄像头权限。",
    },
    poweredBy: {
      en: "Powered by QR Lost & Found",
      zh: "由二维码失物招领提供支持",
    },
    cameraPermissionDenied: {
      en: "Camera permission denied. Please allow camera access to scan QR codes.",
      zh: "摄像头权限被拒绝。请允许摄像头访问以扫描二维码。",
    },
    noCameraFound: {
      en: "No camera found on this device.",
      zh: "此设备上未找到摄像头。",
    },
    cameraAccessError: {
      en: "Error accessing camera:",
      zh: "访问摄像头错误：",
    },
    manualEntryPrompt: {
      en: "Enter QR code manually:",
      zh: "手动输入二维码：",
    },
  },
  signup: {
    title: {
      en: "Create your account",
      zh: "创建您的账户",
    },
    subtitle: {
      en: "Join QR Lost & Found to register and track your items",
      zh: "加入二维码失物招领，注册和追踪您的物品",
    },
    confirmPassword: {
      en: "Confirm Password",
      zh: "确认密码",
    },
    confirmPasswordPlaceholder: {
      en: "Confirm your password",
      zh: "确认您的密码",
    },
    createAccount: {
      en: "Create account",
      zh: "创建账户",
    },
    creatingAccount: {
      en: "Creating account...",
      zh: "正在创建账户...",
    },
    alreadyHaveAccount: {
      en: "Already have an account?",
      zh: "已有账户？",
    },
    signInHere: {
      en: "Sign in here",
      zh: "点击登录",
    },
    allFieldsRequired: {
      en: "All fields are required",
      zh: "所有字段都是必填的",
    },
    passwordsMismatch: {
      en: "Passwords do not match",
      zh: "密码不匹配",
    },
  },
  common: {
    loading: {
      en: "Loading...",
      zh: "加载中...",
    },
    unexpectedError: {
      en: "An unexpected error occurred. Please try again.",
      zh: "发生意外错误，请重试。",
    },
    signingIn: {
      en: "Signing in...",
      zh: "正在登录...",
    },
    copyright: {
      en: "© 2025 QR Lost & Found. Made to help reunite people with their belongings.",
      zh: "© 2025 二维码失物招领。帮助人们找回遗失物品。",
    },
    poweredBy: {
      en: "Powered by QR Lost & Found",
      zh: "由二维码失物招领提供支持",
    },
    invalidQRCode: {
      en: "Invalid QR Code",
      zh: "无效的二维码",
    },
    goToHome: {
      en: "Go to Home",
      zh: "返回主页",
    },
  },
  dashboard: {
    title: {
      en: "My Dashboard",
      zh: "我的控制面板",
    },
    loggedInAs: {
      en: "Logged in as:",
      zh: "当前登录：",
    },
    logout: {
      en: "Logout",
      zh: "退出登录",
    },
    activeItems: {
      en: "Active Items",
      zh: "活跃物品",
    },
    reportedFound: {
      en: "Reported Found",
      zh: "已报告找到",
    },
    awaitingPickup: {
      en: "Awaiting Pickup",
      zh: "等待取回",
    },
    pickedUp: {
      en: "Picked Up",
      zh: "已取回",
    },
    yourItems: {
      en: "Your Items",
      zh: "您的物品",
    },
    scanQRCode: {
      en: "Scan QR Code",
      zh: "扫描二维码",
    },
    noItemsYet: {
      en: "No Items Yet",
      zh: "暂无物品",
    },
    scanToRegister: {
      en: "Scan a QR code to register your first item!",
      zh: "扫描二维码注册您的第一个物品！",
    },
    statusActive: {
      en: "✅ Active",
      zh: "✅ 活跃",
    },
    statusReportedFound: {
      en: "⚠️ Reported Found",
      zh: "⚠️ 已报告找到",
    },
    statusDroppedOff: {
      en: "📦 Dropped Off",
      zh: "📦 已交接",
    },
    statusPickedUp: {
      en: "✅ Picked Up",
      zh: "✅ 已取回",
    },
    statusExpired: {
      en: "⏰ Expired",
      zh: "⏰ 已过期",
    },
    qrCode: {
      en: "QR:",
      zh: "二维码：",
    },
    reportedFoundAlert: {
      en: "⚠️ Someone reported finding your item! They haven't dropped it off yet.",
      zh: "⚠️ 有人报告找到了您的物品！他们还没有交接。",
    },
    falseAlarm: {
      en: "False Alarm - I Have It",
      zh: "误报 - 我有它",
    },
    pickupAlert: {
      en: "🚨 PICK UP YOUR ITEM!",
      zh: "🚨 请取回您的物品！",
    },
    location: {
      en: "Location:",
      zh: "地点：",
    },
    address: {
      en: "Address:",
      zh: "地址：",
    },
    phone: {
      en: "Phone:",
      zh: "电话：",
    },
    timeRemaining: {
      en: "Time remaining:",
      zh: "剩余时间：",
    },
    days: {
      en: "days",
      zh: "天",
    },
    hours: {
      en: "hours",
      zh: "小时",
    },
    markPickedUp: {
      en: "✅ Mark as Picked Up",
      zh: "✅ 标记为已取回",
    },
    reportFalseDropoff: {
      en: "Report False Drop-off",
      zh: "报告虚假交接",
    },
    pickedUpOn: {
      en: "✅ This item was picked up on",
      zh: "✅ 此物品已于以下日期取回",
    },
    resetToActive: {
      en: "Reset to Active",
      zh: "重置为活跃",
    },
    pickupExpiredAlert: {
      en: "⏰ Pickup period expired. The item may have been donated or discarded.",
      zh: "⏰ 取回期限已过。物品可能已被捐赠或丢弃。",
    },
    unlinkQRCode: {
      en: "🗑️ Unlink QR Code",
      zh: "🗑️ 取消关联二维码",
    },
    confirmUnlink: {
      en: "Are you sure you want to unlink \"{itemName}\"?\n\nThis will permanently remove this QR code from your account. The QR code can be re-registered later.",
      zh: "确定要取消关联\"{itemName}\"吗？\n\n这将永久从您的账户中移除此二维码。该二维码稍后可以重新注册。",
    },
    unlinkFailed: {
      en: "Failed to unlink item. Please try again.",
      zh: "取消关联物品失败。请重试。",
    },
    confirmFalseReport: {
      en: "Are you sure this is a false report? This will reset the item to active status.",
      zh: "确定这是误报吗？这将把物品重置为活跃状态。",
    },
  },
  register: {
    title: {
      en: "Register Your QR Code",
      zh: "注册您的二维码",
    },
    subtitle: {
      en: "Protect your items with QR Lost & Found",
      zh: "使用二维码失物招领保护您的物品",
    },
    qrCodeInfo: {
      en: "QR Code",
      zh: "二维码",
    },
    qrCodeId: {
      en: "QR Code ID:",
      zh: "二维码编号：",
    },
    itemInformation: {
      en: "Item Information",
      zh: "物品信息",
    },
    itemName: {
      en: "Item Name",
      zh: "物品名称",
    },
    itemNamePlaceholder: {
      en: "e.g., Black Backpack, Water Bottle",
      zh: "例如：黑色背包、水杯",
    },
    yourName: {
      en: "Your Name (optional)",
      zh: "您的姓名（可选）",
    },
    yourNamePlaceholder: {
      en: "John Doe",
      zh: "张三",
    },
    registeredEmail: {
      en: "Registered Email",
      zh: "注册邮箱",
    },
    accountNote: {
      en: "Items will be registered to your authenticated account",
      zh: "物品将注册到您的认证账户",
    },
    registerItem: {
      en: "Register Item",
      zh: "注册物品",
    },
    registering: {
      en: "Registering...",
      zh: "正在注册...",
    },
    nextSteps: {
      en: "Next Steps",
      zh: "下一步",
    },
    nextStepsDescription: {
      en: "After registration, keep this QR code on your item. If someone finds it, they can scan it with their phone camera to help return it to you!",
      zh: "注册后，请将此二维码贴在您的物品上。如果有人找到它，他们可以用手机摄像头扫描来帮助您找回！",
    },
    invalidQRCode: {
      en: "Invalid QR Code",
      zh: "无效的二维码",
    },
    howToRegister: {
      en: "How to Register",
      zh: "如何注册",
    },
    registrationComplete: {
      en: "Registration Complete!",
      zh: "注册完成！",
    },
    registrationSuccess: {
      en: "Your {item} has been registered successfully.",
      zh: "您的{item}已成功注册。",
    },
    manageItems: {
      en: "Manage Your Items",
      zh: "管理您的物品",
    },
    trackItems: {
      en: "Track your registered items and get notified if they're found!",
      zh: "追踪您注册的物品，如果找到会收到通知！",
    },
    registeredTo: {
      en: "Registered to:",
      zh: "注册到：",
    },
    goToDashboard: {
      en: "Go to Dashboard",
      zh: "前往控制面板",
    },
    mustBeLoggedIn: {
      en: "You must be logged in to register items.",
      zh: "您必须登录才能注册物品。",
    },
    invalidQRCodeError: {
      en: "Invalid QR code.",
      zh: "无效的二维码。",
    },
    registrationFailed: {
      en: "Failed to register item. Please try again.",
      zh: "注册物品失败。请重试。",
    },
    howToRegisterStep1: {
      en: "1. Scan a valid QR code with your phone camera",
      zh: "1. 用手机摄像头扫描有效的二维码",
    },
    howToRegisterStep2: {
      en: "2. The QR code must redirect to this website",
      zh: "2. 二维码必须重定向到本网站",
    },
    howToRegisterStep3: {
      en: "3. You'll then be able to register the item",
      zh: "3. 然后您就可以注册物品了",
    },
    scanQRCodeLink: {
      en: "Scan QR Code",
      zh: "扫描二维码",
    },
    myDashboard: {
      en: "My Dashboard",
      zh: "我的控制面板",
    },
  },
  found: {
    loadingTitle: {
      en: "Loading...",
      zh: "加载中...",
    },
    loadingDescription: {
      en: "Checking QR code registration status...",
      zh: "正在检查二维码注册状态...",
    },
    notRegisteredTitle: {
      en: "QR Code Not Registered",
      zh: "二维码未注册",
    },
    notRegisteredDescription: {
      en: "This QR code hasn't been registered yet. Register it to start protecting your item!",
      zh: "此二维码尚未注册。请注册以开始保护您的物品！",
    },
    registerThisQR: {
      en: "Register This QR Code",
      zh: "注册此二维码",
    },
    thisItemBelongsTo: {
      en: "This Item Belongs To",
      zh: "此物品属于",
    },
    lostItemFound: {
      en: "Lost Item Found",
      zh: "找到遗失物品",
    },
    helpReturn: {
      en: "If you found this item, please help return it!",
      zh: "如果您找到了这个物品，请帮助归还！",
    },
    itemDetails: {
      en: "Item Details",
      zh: "物品详情",
    },
    item: {
      en: "Item:",
      zh: "物品：",
    },
    iFoundThis: {
      en: "I Found This Item",
      zh: "我找到了这个物品",
    },
    selectDropoffLocation: {
      en: "Select Drop-off Location",
      zh: "选择交接地点",
    },
    dropoffInstruction: {
      en: "Please drop off the item at one of these partner locations:",
      zh: "请将物品送到以下合作地点之一：",
    },
    ownerNotified: {
      en: "The owner has been notified that you found their item. Please select where you'll drop it off.",
      zh: "物品所有者已收到您找到其物品的通知。请选择您将在哪里交接。",
    },
    availableLocations: {
      en: "Available Locations",
      zh: "可用地点",
    },
    confirmDropoff: {
      en: "Confirm Drop-off",
      zh: "确认交接",
    },
    youSelected: {
      en: "You selected:",
      zh: "您选择了：",
    },
    important: {
      en: "Important",
      zh: "重要提示",
    },
    dropoffWarning: {
      en: "Please only click \"I Dropped It Off\" after you have physically dropped off the item at the location.",
      zh: "请只在您已将物品实际送达地点后点击\"我已交接\"。",
    },
    instructions: {
      en: "Instructions:",
      zh: "操作说明：",
    },
    instruction1: {
      en: "Take the item to {location}",
      zh: "将物品送到{location}",
    },
    instruction2: {
      en: "Tell the staff you're dropping off a lost item from QR Lost & Found",
      zh: "告诉工作人员您正在交接来自二维码失物招领的遗失物品",
    },
    instruction3: {
      en: "After drop-off, return here and click the button below",
      zh: "交接后，返回此处并点击下方按钮",
    },
    iDroppedItOff: {
      en: "I Dropped It Off Here",
      zh: "我已在此处交接",
    },
    chooseDifferent: {
      en: "Choose Different Location",
      zh: "选择其他地点",
    },
    awaitingPickupTitle: {
      en: "Item Awaiting Pickup",
      zh: "物品等待取回",
    },
    awaitingPickupDescription: {
      en: "This item is at a drop-off location",
      zh: "此物品在交接地点",
    },
    dropoffConfirmed: {
      en: "Drop-off Confirmed",
      zh: "交接已确认",
    },
    location: {
      en: "Location:",
      zh: "地点：",
    },
    pickupDeadline: {
      en: "Pickup Deadline:",
      zh: "取回截止日期：",
    },
    timeRemaining: {
      en: "Time remaining:",
      zh: "剩余时间：",
    },
    days: {
      en: "days",
      zh: "天",
    },
    hours: {
      en: "hours",
      zh: "小时",
    },
    mins: {
      en: "mins",
      zh: "分钟",
    },
    sevenDayNotice: {
      en: "The owner has 7 days to pick up this item. After that, it may be donated or discarded.",
      zh: "物品所有者有7天时间取回此物品。之后可能会被捐赠或丢弃。",
    },
    thankYou: {
      en: "Thank you for helping return this item to its owner!",
      zh: "感谢您帮助将此物品归还给所有者！",
    },
    itemRetrieved: {
      en: "Item Retrieved!",
      zh: "物品已取回！",
    },
    itemRetrievedDescription: {
      en: "This item has been picked up by the owner.",
      zh: "此物品已被所有者取回。",
    },
    ownerRetrieved: {
      en: "The owner successfully retrieved their {item}.",
      zh: "所有者成功取回了他们的{item}。",
    },
    pickupExpired: {
      en: "Pickup Period Expired",
      zh: "取回期限已过",
    },
    pickupExpiredDescription: {
      en: "The 7-day pickup window for this item has expired.",
      zh: "此物品的7天取回期限已过。",
    },
    expiredNotice: {
      en: "The item may have been donated or discarded according to the drop-off location's policy.",
      zh: "根据交接地点的政策，物品可能已被捐赠或丢弃。",
    },
    invalidQRMessage: {
      en: "Please scan a valid QR code.",
      zh: "请扫描有效的二维码。",
    },
    suspenseLoading: {
      en: "Loading...",
      zh: "加载中...",
    },
    invalidQRFormat: {
      en: "Invalid QR code format",
      zh: "二维码格式无效",
    },
    alreadyReported: {
      en: "Someone else already reported finding this item. You can help by dropping it off at a location below.",
      zh: "已有人报告找到此物品。您可以通过将其送到下方地点来提供帮助。",
    },
    helpDropOff: {
      en: "Help Drop Off This Item",
      zh: "帮助交接此物品",
    },
  },
} as const;
