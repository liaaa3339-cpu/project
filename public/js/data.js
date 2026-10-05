/* =========================================================
   Gymmy – content data
   Exercises, workouts and the training rules behind sets/reps.
   Every user-facing text has an English (en) and Arabic (ar) version.
   ========================================================= */
window.GYMMY_DATA = (function () {
  'use strict';

  const MUSCLES = ['chest', 'back', 'shoulders', 'arms', 'legs', 'glutes', 'core', 'fullbody'];
  const LOCATIONS = ['home', 'gym'];
  const LEVELS = ['beginner', 'intermediate', 'advanced'];
  const GENDERS = ['male', 'female'];

  /*
   * Sets, reps and rest (seconds) by gender and difficulty.
   * 'all' is used when no gender is selected in the filters.
   * 'reps' exercises count repetitions; 'time' exercises are held or done for `secs`.
   */
  const PLANS = {
    reps: {
      all: {
        beginner: { sets: 3, reps: '10–12', rest: 60 },
        intermediate: { sets: 3, reps: '8–12', rest: 75 },
        advanced: { sets: 4, reps: '8–10', rest: 90 },
      },
      male: {
        beginner: { sets: 3, reps: '8–12', rest: 75 },
        intermediate: { sets: 4, reps: '8–10', rest: 90 },
        advanced: { sets: 4, reps: '6–8', rest: 120 },
      },
      female: {
        beginner: { sets: 3, reps: '12–15', rest: 45 },
        intermediate: { sets: 3, reps: '12–15', rest: 60 },
        advanced: { sets: 4, reps: '10–12', rest: 75 },
      },
    },
    time: {
      all: {
        beginner: { sets: 3, secs: 30, rest: 30 },
        intermediate: { sets: 3, secs: 40, rest: 30 },
        advanced: { sets: 4, secs: 45, rest: 45 },
      },
      male: {
        beginner: { sets: 3, secs: 30, rest: 45 },
        intermediate: { sets: 3, secs: 45, rest: 45 },
        advanced: { sets: 4, secs: 60, rest: 60 },
      },
      female: {
        beginner: { sets: 3, secs: 30, rest: 30 },
        intermediate: { sets: 3, secs: 40, rest: 30 },
        advanced: { sets: 4, secs: 50, rest: 45 },
      },
    },
  };

  // Muscle groups listed first when a gender is selected (others keep their order).
  const FOCUS = {
    male: ['chest', 'back', 'shoulders', 'arms'],
    female: ['glutes', 'legs', 'core', 'fullbody'],
  };

  /*
   * Exercise fields
   *   id         unique slug, used for favorites and workouts
   *   muscle     one of MUSCLES
   *   location   where it can be done: ['home'], ['gym'] or both
   *   level      one of LEVELS
   *   type       'reps' or 'time'
   *   equipment  keys translated in i18n.js → equipment
   *   perSide    true when reps are counted for each side
   *   reps       optional override of the rep range: { all, male, female }
   *   image      path to your own photo or GIF, e.g. 'assets/images/push-up.jpg'
   */
  const EXERCISES = [
    /* ---------- Chest ---------- */
    {
      id: 'push-up',
      muscle: 'chest',
      location: ['home', 'gym'],
      level: 'beginner',
      type: 'reps',
      equipment: ['none'],
      image: '',
      name: { en: 'Push-up', ar: 'تمرين الضغط' },
      steps: {
        en: [
          'Place your hands slightly wider than shoulder-width, fingers pointing forward.',
          'Step your feet back so your body forms a straight line from head to heels.',
          'Bend your elbows to lower your chest until it is just above the floor.',
          'Push through your palms to straighten your arms and return to the start.',
        ],
        ar: [
          'وضع اليدين على الأرض بمسافة أوسع قليلًا من عرض الكتفين، والأصابع متجهة للأمام.',
          'مدّ القدمين للخلف حتى يستقيم الجسم من الرأس إلى الكعبين.',
          'ثني المرفقين لإنزال الصدر حتى يقترب من الأرض.',
          'الدفع براحتي اليدين لفرد الذراعين والعودة إلى وضع البداية.',
        ],
      },
      tips: {
        en: [
          'Brace your core and squeeze your glutes to keep your hips level.',
          'Too hard? Drop to your knees and keep a straight line from knees to head.',
        ],
        ar: [
          'شدّ عضلات البطن والأرداف لإبقاء الوركين في مستوى واحد.',
          'للتسهيل: النزول على الركبتين مع الحفاظ على استقامة الجسم من الركبتين إلى الرأس.',
        ],
      },
      mistakes: {
        en: [
          'Letting the hips sag or pike up toward the ceiling.',
          'Flaring the elbows straight out to the sides. Keep them at about 45°.',
        ],
        ar: [
          'ترهّل الوركين للأسفل أو رفعهما للأعلى.',
          'فتح المرفقين للجانبين بالكامل، والأفضل إبقاؤهما بزاوية 45° تقريبًا.',
        ],
      },
    },
    {
      id: 'chest-press-machine',
      muscle: 'chest',
      location: ['gym'],
      level: 'beginner',
      type: 'reps',
      equipment: ['machine'],
      image: '',
      name: { en: 'Chest Press Machine', ar: 'جهاز ضغط الصدر' },
      steps: {
        en: [
          'Adjust the seat so the handles line up with the middle of your chest.',
          'Sit tall with your back flat against the pad and grip the handles.',
          'Press the handles forward until your arms are straight but not locked.',
          'Slowly bring the handles back until you feel a stretch across your chest.',
        ],
        ar: [
          'ضبط المقعد بحيث تكون المقابض بمحاذاة منتصف الصدر.',
          'الجلوس باستقامة مع إسناد الظهر إلى المسند والإمساك بالمقابض.',
          'دفع المقابض للأمام حتى تستقيم الذراعان دون قفل المرفقين.',
          'إرجاع المقابض ببطء حتى الشعور بتمدد في الصدر.',
        ],
      },
      tips: {
        en: [
          'Keep your shoulder blades pulled back and down against the pad.',
          'Take 2–3 seconds on the way back for more control.',
        ],
        ar: [
          'إبقاء لوحي الكتف مشدودين للخلف وللأسفل على المسند.',
          'أخذ 2–3 ثوانٍ في مرحلة الرجوع لتحكم أفضل.',
        ],
      },
      mistakes: {
        en: [
          'Setting the seat too low or too high, which strains the shoulders.',
          'Letting the weight stack slam between reps.',
        ],
        ar: [
          'ضبط المقعد منخفضًا أو مرتفعًا جدًا مما يُجهد الكتفين.',
          'ترك الأوزان تصطدم ببعضها بين التكرارات.',
        ],
      },
    },
    {
      id: 'barbell-bench-press',
      muscle: 'chest',
      location: ['gym'],
      level: 'intermediate',
      type: 'reps',
      equipment: ['barbell', 'bench'],
      image: '',
      name: { en: 'Barbell Bench Press', ar: 'ضغط البنش بالبار' },
      steps: {
        en: [
          'Lie on the bench with your eyes under the bar and feet flat on the floor.',
          'Grip the bar a little wider than shoulder-width and unrack it over your shoulders.',
          'Lower the bar with control to your mid-chest, elbows at about 45°.',
          'Press the bar back up in a slight arc until your arms are straight.',
        ],
        ar: [
          'الاستلقاء على البنش بحيث تكون العينان أسفل البار والقدمان ثابتتين على الأرض.',
          'الإمساك بالبار بقبضة أوسع قليلًا من الكتفين ورفعه عن الحامل فوق الكتفين.',
          'إنزال البار بتحكم إلى منتصف الصدر مع إبقاء المرفقين بزاوية 45° تقريبًا.',
          'دفع البار للأعلى في قوس خفيف حتى تستقيم الذراعان.',
        ],
      },
      tips: {
        en: [
          'Squeeze your shoulder blades together and keep them pinned to the bench.',
          'Use a spotter or safety arms when lifting heavy.',
        ],
        ar: [
          'ضمّ لوحي الكتف وتثبيتهما على البنش طوال الحركة.',
          'الاستعانة بمساعد أو حواجز أمان عند رفع أوزان ثقيلة.',
        ],
      },
      mistakes: {
        en: [
          'Bouncing the bar off your chest.',
          'Lifting your hips off the bench to push more weight.',
        ],
        ar: [
          'ارتداد البار عن الصدر.',
          'رفع الوركين عن البنش لدفع وزن أكبر.',
        ],
      },
    },
    {
      id: 'archer-push-up',
      muscle: 'chest',
      location: ['home'],
      level: 'advanced',
      type: 'reps',
      equipment: ['none'],
      perSide: true,
      image: '',
      name: { en: 'Archer Push-up', ar: 'ضغط الرامي' },
      steps: {
        en: [
          'Start in a wide push-up position, hands about twice shoulder-width apart.',
          'Shift your weight toward one hand as you bend that elbow and lower your chest.',
          'Keep the other arm almost straight, reaching out to the side like drawing a bow.',
          'Push back to the center and repeat on the other side.',
        ],
        ar: [
          'البدء بوضعية الضغط مع مباعدة اليدين بمقدار ضعف عرض الكتفين تقريبًا.',
          'نقل الوزن نحو إحدى اليدين مع ثني مرفقها وإنزال الصدر.',
          'إبقاء الذراع الأخرى شبه مستقيمة وممدودة للجانب كمن يشدّ قوسًا.',
          'الدفع للعودة إلى المنتصف ثم التكرار على الجانب الآخر.',
        ],
      },
      tips: {
        en: [
          'Turn the fingers of the straight arm slightly outward to protect the wrist.',
          'Master 15 clean regular push-ups before trying this one.',
        ],
        ar: [
          'توجيه أصابع الذراع المستقيمة قليلًا للخارج لحماية المعصم.',
          'إتقان 15 تكرارًا صحيحًا من الضغط العادي قبل تجربة هذا التمرين.',
        ],
      },
      mistakes: {
        en: [
          'Twisting the hips toward the working side.',
          'Cutting the range of motion short on the bent arm.',
        ],
        ar: [
          'لفّ الوركين نحو الجانب العامل.',
          'تقصير مدى الحركة في الذراع المثنية.',
        ],
      },
    },

    /* ---------- Back ---------- */
    {
      id: 'superman',
      muscle: 'back',
      location: ['home'],
      level: 'beginner',
      type: 'reps',
      equipment: ['mat'],
      image: '',
      name: { en: 'Superman', ar: 'تمرين سوبرمان' },
      steps: {
        en: [
          'Lie face down with your arms stretched overhead and legs straight.',
          'Keep your neck neutral by looking at the floor just ahead of you.',
          'Lift your arms, chest and legs a few centimeters off the floor at the same time.',
          'Hold for 2 seconds, then lower slowly.',
        ],
        ar: [
          'الاستلقاء على البطن مع مدّ الذراعين أمام الرأس وفرد الساقين.',
          'إبقاء الرقبة في وضع محايد بالنظر إلى الأرض قليلًا للأمام.',
          'رفع الذراعين والصدر والساقين عن الأرض بضعة سنتيمترات في آنٍ واحد.',
          'الثبات لثانيتين ثم النزول ببطء.',
        ],
      },
      tips: {
        en: [
          'Think of reaching long through your fingers and toes, not only up.',
          'Squeeze your glutes to protect your lower back.',
        ],
        ar: [
          'التركيز على الامتداد عبر أطراف الأصابع والقدمين، وليس الارتفاع فقط.',
          'شدّ الأرداف لحماية أسفل الظهر.',
        ],
      },
      mistakes: {
        en: [
          'Cranking your head up to look forward.',
          'Jerking up with momentum instead of lifting with control.',
        ],
        ar: [
          'رفع الرأس بقوة للنظر إلى الأمام.',
          'الارتفاع باندفاع بدلًا من الرفع بتحكم.',
        ],
      },
    },
    {
      id: 'lat-pulldown',
      muscle: 'back',
      location: ['gym'],
      level: 'beginner',
      type: 'reps',
      equipment: ['cable'],
      image: '',
      name: { en: 'Lat Pulldown', ar: 'السحب العلوي' },
      steps: {
        en: [
          'Sit with your thighs tucked under the pads and grab the bar wider than your shoulders.',
          'Lean back slightly and lift your chest.',
          'Pull the bar down to your upper chest by driving your elbows toward your ribs.',
          'Let the bar rise slowly until your arms are fully extended.',
        ],
        ar: [
          'الجلوس مع تثبيت الفخذين أسفل المساند والإمساك بالبار بقبضة أوسع من الكتفين.',
          'الميل للخلف قليلًا مع رفع الصدر.',
          'سحب البار إلى أعلى الصدر بدفع المرفقين نحو الأضلاع.',
          'ترك البار يرتفع ببطء حتى تمتد الذراعان بالكامل.',
        ],
      },
      tips: {
        en: [
          'Start each rep by pulling your shoulder blades down.',
          'Imagine your hands are hooks and let your back do the pulling.',
        ],
        ar: [
          'بدء كل تكرار بسحب لوحي الكتف للأسفل.',
          'تخيّل اليدين كخطافين وترك عضلات الظهر تقوم بالسحب.',
        ],
      },
      mistakes: {
        en: [
          'Pulling the bar behind your neck.',
          'Swinging your torso back to move the weight.',
        ],
        ar: [
          'سحب البار خلف الرقبة.',
          'أرجحة الجذع للخلف لتحريك الوزن.',
        ],
      },
    },
    {
      id: 'dumbbell-row',
      muscle: 'back',
      location: ['home', 'gym'],
      level: 'intermediate',
      type: 'reps',
      equipment: ['dumbbells', 'bench'],
      perSide: true,
      image: '',
      name: { en: 'One-arm Dumbbell Row', ar: 'التجديف بالدمبل بذراع واحدة' },
      steps: {
        en: [
          'Place one knee and the same-side hand on a bench, keeping your back flat.',
          'Hold a dumbbell in the other hand with your arm hanging straight down.',
          'Row the dumbbell toward your hip, keeping your elbow close to your body.',
          'Lower it slowly until your arm is straight, then repeat.',
        ],
        ar: [
          'وضع إحدى الركبتين واليد المماثلة على مقعد مع إبقاء الظهر مستقيمًا.',
          'حمل الدمبل باليد الأخرى مع ترك الذراع متدلية للأسفل.',
          'سحب الدمبل نحو الورك مع إبقاء المرفق قريبًا من الجسم.',
          'إنزاله ببطء حتى تستقيم الذراع ثم التكرار.',
        ],
      },
      tips: {
        en: [
          'Pull with your elbow, not your hand, to feel it in your back.',
          'No bench at home? Brace one hand on a sturdy chair.',
        ],
        ar: [
          'السحب بالمرفق وليس باليد للشعور بعمل عضلات الظهر.',
          'لا يوجد مقعد في المنزل؟ يمكن الاستناد إلى كرسي ثابت.',
        ],
      },
      mistakes: {
        en: [
          'Rotating your torso to lift the weight.',
          'Shrugging the shoulder up toward the ear.',
        ],
        ar: [
          'لفّ الجذع لرفع الوزن.',
          'رفع الكتف نحو الأذن.',
        ],
      },
    },
    {
      id: 'pull-up',
      muscle: 'back',
      location: ['home', 'gym'],
      level: 'advanced',
      type: 'reps',
      equipment: ['pullupBar'],
      reps: { all: '5–8', male: '6–10', female: '4–8' },
      image: '',
      name: { en: 'Pull-up', ar: 'العقلة' },
      steps: {
        en: [
          'Hang from the bar with an overhand grip slightly wider than your shoulders.',
          'Pull your shoulder blades down and brace your core.',
          'Pull yourself up until your chin clears the bar.',
          'Lower yourself with control until your arms are straight.',
        ],
        ar: [
          'التعلّق بالبار بقبضة علوية أوسع قليلًا من الكتفين.',
          'سحب لوحي الكتف للأسفل وشدّ عضلات البطن.',
          'سحب الجسم للأعلى حتى يتجاوز الذقن مستوى البار.',
          'النزول بتحكم حتى تستقيم الذراعان.',
        ],
      },
      tips: {
        en: [
          'Can’t do one yet? Use a resistance band, or jump up and lower yourself slowly.',
          'Keep your legs still to avoid swinging.',
        ],
        ar: [
          'للمبتدئين: استخدام حبل مقاومة، أو القفز للأعلى ثم النزول ببطء.',
          'إبقاء الساقين ثابتتين لتجنّب التأرجح.',
        ],
      },
      mistakes: {
        en: [
          'Kicking or swinging to get over the bar.',
          'Stopping halfway down instead of reaching a full hang.',
        ],
        ar: [
          'الركل أو التأرجح لتجاوز البار.',
          'التوقف في منتصف النزول بدلًا من التعلّق الكامل.',
        ],
      },
    },

    /* ---------- Shoulders ---------- */
    {
      id: 'lateral-raise',
      muscle: 'shoulders',
      location: ['home', 'gym'],
      level: 'beginner',
      type: 'reps',
      equipment: ['dumbbells'],
      image: '',
      name: { en: 'Lateral Raise', ar: 'الرفرفة الجانبية' },
      steps: {
        en: [
          'Stand tall holding light dumbbells at your sides, palms facing in.',
          'With a slight bend in your elbows, raise your arms out to the sides.',
          'Stop when your hands reach shoulder height.',
          'Lower slowly over 2–3 seconds.',
        ],
        ar: [
          'الوقوف باستقامة مع حمل دمبل خفيف في كل يد بجانب الجسم والكفّان متجهتان للداخل.',
          'رفع الذراعين إلى الجانبين مع ثني بسيط في المرفقين.',
          'التوقف عندما تصل اليدان إلى مستوى الكتفين.',
          'الإنزال ببطء خلال 2–3 ثوانٍ.',
        ],
      },
      tips: {
        en: [
          'Lead with your elbows, as if pouring water from a jug.',
          'Go light. Your shoulders tire quickly on this one.',
        ],
        ar: [
          'قيادة الحركة بالمرفقين كمن يسكب الماء من إبريق.',
          'اختيار وزن خفيف، فعضلات الكتف تتعب سريعًا في هذا التمرين.',
        ],
      },
      mistakes: {
        en: [
          'Shrugging your shoulders up toward your ears.',
          'Swinging the weights up with your back.',
        ],
        ar: [
          'رفع الكتفين نحو الأذنين.',
          'أرجحة الأوزان باستخدام الظهر.',
        ],
      },
    },
    {
      id: 'pike-push-up',
      muscle: 'shoulders',
      location: ['home'],
      level: 'intermediate',
      type: 'reps',
      equipment: ['none'],
      image: '',
      name: { en: 'Pike Push-up', ar: 'ضغط البايك' },
      steps: {
        en: [
          'Start in a push-up position, then walk your feet in and lift your hips into an upside-down V.',
          'Keep your arms straight and your head between your arms.',
          'Bend your elbows to lower the top of your head toward the floor.',
          'Press back up until your arms are straight.',
        ],
        ar: [
          'البدء بوضعية الضغط ثم تقريب القدمين ورفع الوركين ليأخذ الجسم شكل حرف V مقلوب.',
          'إبقاء الذراعين مستقيمتين والرأس بين الذراعين.',
          'ثني المرفقين لإنزال أعلى الرأس نحو الأرض.',
          'الدفع للأعلى حتى تستقيم الذراعان.',
        ],
      },
      tips: {
        en: [
          'The higher your hips, the more your shoulders work.',
          'Put your feet on a step to make it harder.',
        ],
        ar: [
          'كلما ارتفع الوركان زاد عمل عضلات الكتف.',
          'رفع القدمين على درجة لزيادة الصعوبة.',
        ],
      },
      mistakes: {
        en: [
          'Letting the hips drop so it turns into a regular push-up.',
          'Flaring the elbows wide.',
        ],
        ar: [
          'خفض الوركين فيتحول التمرين إلى ضغط عادي.',
          'فتح المرفقين للخارج كثيرًا.',
        ],
      },
    },
    {
      id: 'dumbbell-shoulder-press',
      muscle: 'shoulders',
      location: ['home', 'gym'],
      level: 'intermediate',
      type: 'reps',
      equipment: ['dumbbells', 'bench'],
      image: '',
      name: { en: 'Dumbbell Shoulder Press', ar: 'ضغط الأكتاف بالدمبل' },
      steps: {
        en: [
          'Sit or stand holding dumbbells at shoulder height, palms facing forward.',
          'Brace your core and keep your ribs down.',
          'Press the dumbbells overhead until your arms are straight.',
          'Lower them back to shoulder height with control.',
        ],
        ar: [
          'الجلوس أو الوقوف مع حمل الدمبل عند مستوى الكتفين والكفّان متجهتان للأمام.',
          'شدّ عضلات البطن وإبقاء الأضلاع للأسفل.',
          'دفع الدمبل فوق الرأس حتى تستقيم الذراعان.',
          'إنزاله بتحكم إلى مستوى الكتفين.',
        ],
      },
      tips: {
        en: [
          'Keep your wrists stacked directly over your elbows.',
          'Sitting with back support is easier on the lower back.',
        ],
        ar: [
          'إبقاء المعصمين فوق المرفقين مباشرة.',
          'الجلوس مع إسناد الظهر أريح لأسفل الظهر.',
        ],
      },
      mistakes: {
        en: [
          'Arching your lower back to push the weight up.',
          'Clanking the dumbbells together at the top.',
        ],
        ar: [
          'تقويس أسفل الظهر لدفع الوزن.',
          'ضرب الدمبلين ببعضهما في الأعلى.',
        ],
      },
    },
    {
      id: 'overhead-press',
      muscle: 'shoulders',
      location: ['gym'],
      level: 'advanced',
      type: 'reps',
      equipment: ['barbell'],
      image: '',
      name: { en: 'Barbell Overhead Press', ar: 'الضغط العلوي بالبار' },
      steps: {
        en: [
          'Stand with the bar resting on your front shoulders, hands just outside shoulder-width.',
          'Squeeze your glutes and brace your core.',
          'Press the bar straight up, moving your head back slightly to let it pass.',
          'Lock out overhead with the bar over your mid-foot, then lower it to your shoulders.',
        ],
        ar: [
          'الوقوف مع إسناد البار على مقدمة الكتفين واليدان خارج عرض الكتفين بقليل.',
          'شدّ الأرداف وعضلات البطن.',
          'دفع البار للأعلى بشكل مستقيم مع إرجاع الرأس قليلًا ليمرّ البار.',
          'فرد الذراعين فوق الرأس بحيث يكون البار فوق منتصف القدم، ثم إنزاله إلى الكتفين.',
        ],
      },
      tips: {
        en: [
          'Push your head forward once the bar clears your face.',
          'Keep your elbows slightly in front of the bar at the start.',
        ],
        ar: [
          'إدخال الرأس للأمام بعد مرور البار أمام الوجه.',
          'إبقاء المرفقين أمام البار قليلًا في البداية.',
        ],
      },
      mistakes: {
        en: [
          'Leaning far back and turning it into a standing incline press.',
          'Pressing the bar forward instead of straight up.',
        ],
        ar: [
          'الميل للخلف بشكل مبالغ فيه.',
          'دفع البار للأمام بدلًا من الأعلى.',
        ],
      },
    },

    /* ---------- Arms ---------- */
    {
      id: 'biceps-curl',
      muscle: 'arms',
      location: ['home', 'gym'],
      level: 'beginner',
      type: 'reps',
      equipment: ['dumbbells'],
      image: '',
      name: { en: 'Dumbbell Biceps Curl', ar: 'تمرين البايسبس بالدمبل' },
      steps: {
        en: [
          'Stand tall with a dumbbell in each hand, arms straight and palms facing forward.',
          'Keep your elbows pinned to your sides.',
          'Curl the weights up toward your shoulders by bending your elbows.',
          'Squeeze at the top, then lower slowly until your arms are straight.',
        ],
        ar: [
          'الوقوف باستقامة مع حمل دمبل في كل يد والذراعان مفرودتان والكفّان للأمام.',
          'إبقاء المرفقين ملتصقين بجانبي الجسم.',
          'ثني المرفقين لرفع الدمبل نحو الكتفين.',
          'شدّ العضلة في الأعلى ثم الإنزال ببطء حتى تستقيم الذراعان.',
        ],
      },
      tips: {
        en: [
          'Lowering slowly builds as much strength as lifting.',
          'Alternate arms if you need to focus on form.',
        ],
        ar: [
          'الإنزال البطيء يبني القوة بقدر الرفع.',
          'التبديل بين الذراعين للتركيز على الأداء الصحيح.',
        ],
      },
      mistakes: {
        en: [
          'Swinging the weights with your hips and back.',
          'Letting the elbows drift forward.',
        ],
        ar: [
          'أرجحة الأوزان باستخدام الوركين والظهر.',
          'تقدّم المرفقين للأمام أثناء الرفع.',
        ],
      },
    },
    {
      id: 'chair-dips',
      muscle: 'arms',
      location: ['home'],
      level: 'beginner',
      type: 'reps',
      equipment: ['chair'],
      image: '',
      name: { en: 'Chair Dips', ar: 'الغطس على الكرسي' },
      steps: {
        en: [
          'Sit on the edge of a sturdy chair and grip the edge beside your hips.',
          'Slide your hips forward off the seat, knees bent and feet flat.',
          'Bend your elbows to lower your body until your upper arms are about parallel to the floor.',
          'Press through your palms to straighten your arms.',
        ],
        ar: [
          'الجلوس على حافة كرسي ثابت والإمساك بالحافة بجانب الوركين.',
          'تحريك الوركين للأمام خارج المقعد مع ثني الركبتين وتثبيت القدمين.',
          'ثني المرفقين لإنزال الجسم حتى يصبح العضد موازيًا للأرض تقريبًا.',
          'الدفع براحتي اليدين لفرد الذراعين.',
        ],
      },
      tips: {
        en: [
          'Keep your back close to the chair the whole time.',
          'Straighten your legs to make it harder.',
        ],
        ar: [
          'إبقاء الظهر قريبًا من الكرسي طوال الحركة.',
          'فرد الساقين لزيادة الصعوبة.',
        ],
      },
      mistakes: {
        en: [
          'Dropping too low, which strains the front of the shoulders.',
          'Letting the elbows flare out to the sides.',
        ],
        ar: [
          'النزول بشكل مبالغ فيه مما يُجهد مقدمة الكتف.',
          'فتح المرفقين للجانبين.',
        ],
      },
    },
    {
      id: 'triceps-pushdown',
      muscle: 'arms',
      location: ['gym'],
      level: 'intermediate',
      type: 'reps',
      equipment: ['cable'],
      image: '',
      name: { en: 'Cable Triceps Pushdown', ar: 'دفع الترايسبس بالكابل' },
      steps: {
        en: [
          'Attach a rope or bar to a high cable and grab it with both hands.',
          'Stand tall with your elbows tucked at your sides.',
          'Push the handle down until your arms are fully straight.',
          'Let it rise slowly until your forearms are just above parallel.',
        ],
        ar: [
          'تثبيت حبل أو بار في الكابل العلوي والإمساك به باليدين.',
          'الوقوف باستقامة مع إبقاء المرفقين ملاصقين للجانبين.',
          'دفع المقبض للأسفل حتى تستقيم الذراعان بالكامل.',
          'تركه يرتفع ببطء حتى يصبح الساعدان أعلى من الوضع الأفقي بقليل.',
        ],
      },
      tips: {
        en: [
          'With a rope, pull the ends apart at the bottom.',
          'Only your forearms should move.',
        ],
        ar: [
          'عند استخدام الحبل: فصل طرفيه عن بعضهما في الأسفل.',
          'الساعدان فقط يتحركان.',
        ],
      },
      mistakes: {
        en: [
          'Letting your elbows move forward and back.',
          'Leaning over the handle to use your body weight.',
        ],
        ar: [
          'تحريك المرفقين للأمام والخلف.',
          'الانحناء فوق المقبض لاستخدام وزن الجسم.',
        ],
      },
    },
    {
      id: 'parallel-bar-dips',
      muscle: 'arms',
      location: ['gym'],
      level: 'advanced',
      type: 'reps',
      equipment: ['parallelBars'],
      reps: { all: '6–10', male: '6–10', female: '5–8' },
      image: '',
      name: { en: 'Parallel Bar Dips', ar: 'الغطس على المتوازي' },
      steps: {
        en: [
          'Grip the bars and lift yourself up until your arms are straight.',
          'Keep your torso upright to target the triceps.',
          'Bend your elbows to lower until your upper arms are parallel to the floor.',
          'Press back up to straight arms.',
        ],
        ar: [
          'الإمساك بالمتوازي ورفع الجسم حتى تستقيم الذراعان.',
          'إبقاء الجذع مستقيمًا لاستهداف عضلة الترايسبس.',
          'ثني المرفقين والنزول حتى يصبح العضد موازيًا للأرض.',
          'الدفع للأعلى حتى تستقيم الذراعان.',
        ],
      },
      tips: {
        en: [
          'Cross your ankles and keep your legs still.',
          'Use the assisted dip machine while you build strength.',
        ],
        ar: [
          'تشبيك الكاحلين وإبقاء الساقين ثابتتين.',
          'استخدام جهاز الغطس المساعد أثناء بناء القوة.',
        ],
      },
      mistakes: {
        en: [
          'Sinking too deep and straining the shoulders.',
          'Shrugging your shoulders up at the bottom.',
        ],
        ar: [
          'النزول لعمق مبالغ فيه وإجهاد الكتفين.',
          'رفع الكتفين نحو الأذنين في الأسفل.',
        ],
      },
    },

    /* ---------- Legs ---------- */
    {
      id: 'bodyweight-squat',
      muscle: 'legs',
      location: ['home'],
      level: 'beginner',
      type: 'reps',
      equipment: ['none'],
      image: '',
      name: { en: 'Bodyweight Squat', ar: 'السكوات بوزن الجسم' },
      steps: {
        en: [
          'Stand with feet shoulder-width apart, toes turned out slightly.',
          'Push your hips back and bend your knees as if sitting into a chair.',
          'Lower until your thighs are about parallel to the floor, keeping your chest up.',
          'Drive through your whole foot to stand back up.',
        ],
        ar: [
          'الوقوف مع مباعدة القدمين بعرض الكتفين وتوجيه أصابع القدمين للخارج قليلًا.',
          'دفع الوركين للخلف وثني الركبتين كمن يجلس على كرسي.',
          'النزول حتى يصبح الفخذان موازيين للأرض تقريبًا مع إبقاء الصدر مرفوعًا.',
          'الدفع بكامل القدم للعودة إلى الوقوف.',
        ],
      },
      tips: {
        en: [
          'Reach your arms forward for balance.',
          'Keep your knees in line with your toes.',
        ],
        ar: [
          'مدّ الذراعين للأمام للمحافظة على التوازن.',
          'إبقاء الركبتين على خط أصابع القدمين.',
        ],
      },
      mistakes: {
        en: [
          'Letting the knees cave inward.',
          'Lifting the heels off the floor.',
        ],
        ar: [
          'انحناء الركبتين للداخل.',
          'رفع الكعبين عن الأرض.',
        ],
      },
    },
    {
      id: 'leg-press',
      muscle: 'legs',
      location: ['gym'],
      level: 'beginner',
      type: 'reps',
      equipment: ['machine'],
      image: '',
      name: { en: 'Leg Press', ar: 'جهاز دفع الأرجل' },
      steps: {
        en: [
          'Sit in the machine with your back flat and feet hip-width apart on the platform.',
          'Release the safety handles and lower the platform by bending your knees.',
          'Stop when your knees reach about 90°.',
          'Press the platform away without locking your knees.',
        ],
        ar: [
          'الجلوس في الجهاز مع إسناد الظهر ووضع القدمين على المنصة بعرض الوركين.',
          'فكّ مقابض الأمان وإنزال المنصة بثني الركبتين.',
          'التوقف عندما تصل الركبتان إلى زاوية 90° تقريبًا.',
          'دفع المنصة بعيدًا دون قفل الركبتين.',
        ],
      },
      tips: {
        en: [
          'Feet higher on the platform work more glutes; lower works more quads.',
          'Keep your lower back pressed into the pad.',
        ],
        ar: [
          'وضع القدمين أعلى المنصة يشغّل الأرداف أكثر، ووضعهما أسفلها يشغّل عضلات الفخذ الأمامية.',
          'إبقاء أسفل الظهر ملتصقًا بالمسند.',
        ],
      },
      mistakes: {
        en: [
          'Locking the knees out at the top.',
          'Lowering so far that your hips curl off the seat.',
        ],
        ar: [
          'قفل الركبتين في الأعلى.',
          'النزول بعمق يرفع الوركين عن المقعد.',
        ],
      },
    },
    {
      id: 'walking-lunge',
      muscle: 'legs',
      location: ['home', 'gym'],
      level: 'intermediate',
      type: 'reps',
      equipment: ['none'],
      perSide: true,
      image: '',
      name: { en: 'Walking Lunge', ar: 'الطعن مع المشي' },
      steps: {
        en: [
          'Stand tall with feet together and hands on your hips.',
          'Take a long step forward and lower until both knees are bent at about 90°.',
          'Push through your front heel and bring your back foot forward into the next step.',
          'Keep alternating legs as you walk forward.',
        ],
        ar: [
          'الوقوف باستقامة مع ضمّ القدمين ووضع اليدين على الوركين.',
          'أخذ خطوة طويلة للأمام والنزول حتى تنثني الركبتان بزاوية 90° تقريبًا.',
          'الدفع بكعب القدم الأمامية وتقديم القدم الخلفية للخطوة التالية.',
          'التبديل بين الساقين أثناء التقدم للأمام.',
        ],
      },
      tips: {
        en: [
          'Hold dumbbells at your sides to make it harder.',
          'Keep your torso upright and your eyes forward.',
        ],
        ar: [
          'حمل دمبل في كل يد لزيادة الصعوبة.',
          'إبقاء الجذع مستقيمًا والنظر للأمام.',
        ],
      },
      mistakes: {
        en: [
          'Letting the front knee cave inward.',
          'Taking steps that are too short, which stresses the knee.',
        ],
        ar: [
          'انحناء الركبة الأمامية للداخل.',
          'أخذ خطوات قصيرة جدًا مما يضغط على الركبة.',
        ],
      },
    },
    {
      id: 'barbell-back-squat',
      muscle: 'legs',
      location: ['gym'],
      level: 'advanced',
      type: 'reps',
      equipment: ['barbell'],
      image: '',
      name: { en: 'Barbell Back Squat', ar: 'السكوات الخلفي بالبار' },
      steps: {
        en: [
          'Set the bar on your upper back, not your neck, and step back from the rack.',
          'Stand with feet shoulder-width apart and brace your core.',
          'Sit your hips back and down until your thighs are at least parallel.',
          'Drive up through your mid-foot, keeping your chest up.',
        ],
        ar: [
          'وضع البار على أعلى الظهر لا على الرقبة، ثم الرجوع خطوة عن الحامل.',
          'الوقوف مع مباعدة القدمين بعرض الكتفين وشدّ عضلات البطن.',
          'إنزال الوركين للخلف وللأسفل حتى يصبح الفخذان موازيين للأرض على الأقل.',
          'الدفع للأعلى من منتصف القدم مع إبقاء الصدر مرفوعًا.',
        ],
      },
      tips: {
        en: [
          'Take a big breath and hold it on the way down.',
          'Set the safety bars just below your lowest squat position.',
        ],
        ar: [
          'أخذ نفس عميق وحبسه أثناء النزول.',
          'ضبط حواجز الأمان أسفل أدنى نقطة في النزول مباشرة.',
        ],
      },
      mistakes: {
        en: [
          'Rounding the lower back at the bottom.',
          'Letting your hips shoot up before your chest.',
        ],
        ar: [
          'تقوّس أسفل الظهر في الأسفل.',
          'ارتفاع الوركين قبل الصدر.',
        ],
      },
    },

    /* ---------- Glutes ---------- */
    {
      id: 'glute-bridge',
      muscle: 'glutes',
      location: ['home'],
      level: 'beginner',
      type: 'reps',
      equipment: ['mat'],
      image: '',
      name: { en: 'Glute Bridge', ar: 'جسر الأرداف' },
      steps: {
        en: [
          'Lie on your back with knees bent and feet flat, hip-width apart.',
          'Rest your arms by your sides, palms down.',
          'Push through your heels to lift your hips until your body forms a line from knees to shoulders.',
          'Squeeze your glutes for 2 seconds, then lower slowly.',
        ],
        ar: [
          'الاستلقاء على الظهر مع ثني الركبتين وتثبيت القدمين بعرض الوركين.',
          'وضع الذراعين بجانب الجسم والكفّان للأسفل.',
          'الدفع بالكعبين لرفع الوركين حتى يستقيم الجسم من الركبتين إلى الكتفين.',
          'شدّ الأرداف لثانيتين ثم النزول ببطء.',
        ],
      },
      tips: {
        en: [
          'Rest a dumbbell on your hips to add load.',
          'Tuck your pelvis slightly to feel it more in the glutes.',
        ],
        ar: [
          'وضع دمبل على الوركين لزيادة المقاومة.',
          'إمالة الحوض قليلًا للشعور بعمل الأرداف أكثر.',
        ],
      },
      mistakes: {
        en: [
          'Arching the lower back at the top.',
          'Pushing through the toes instead of the heels.',
        ],
        ar: [
          'تقويس أسفل الظهر في الأعلى.',
          'الدفع بأصابع القدم بدلًا من الكعبين.',
        ],
      },
    },
    {
      id: 'donkey-kick',
      muscle: 'glutes',
      location: ['home'],
      level: 'beginner',
      type: 'reps',
      equipment: ['mat'],
      perSide: true,
      image: '',
      name: { en: 'Donkey Kick', ar: 'ركلة الحمار' },
      steps: {
        en: [
          'Start on all fours with hands under shoulders and knees under hips.',
          'Keeping the knee bent at 90°, lift one leg until your thigh is level with your back.',
          'Push the sole of your foot toward the ceiling and squeeze your glute.',
          'Lower the knee without touching the floor, then repeat.',
        ],
        ar: [
          'البدء على اليدين والركبتين، اليدان أسفل الكتفين والركبتان أسفل الوركين.',
          'رفع إحدى الساقين مع إبقاء الركبة مثنية بزاوية 90° حتى يصبح الفخذ بمستوى الظهر.',
          'دفع باطن القدم نحو السقف مع شدّ الأرداف.',
          'إنزال الركبة دون لمس الأرض ثم التكرار.',
        ],
      },
      tips: {
        en: [
          'Keep your hips square to the floor.',
          'Add an ankle weight or a band for more challenge.',
        ],
        ar: [
          'إبقاء الوركين موازيين للأرض.',
          'إضافة ثقل للكاحل أو حبل مقاومة لزيادة التحدي.',
        ],
      },
      mistakes: {
        en: [
          'Arching the lower back as the leg lifts.',
          'Swinging the leg with momentum.',
        ],
        ar: [
          'تقويس أسفل الظهر عند رفع الساق.',
          'أرجحة الساق باندفاع.',
        ],
      },
    },
    {
      id: 'hip-thrust',
      muscle: 'glutes',
      location: ['gym'],
      level: 'intermediate',
      type: 'reps',
      equipment: ['barbell', 'bench'],
      image: '',
      name: { en: 'Barbell Hip Thrust', ar: 'دفع الورك بالبار' },
      steps: {
        en: [
          'Sit on the floor with your upper back against a bench and a padded bar over your hips.',
          'Plant your feet flat, about hip-width apart, knees bent.',
          'Drive through your heels to lift the bar until your hips are fully extended.',
          'Pause and squeeze at the top, then lower with control.',
        ],
        ar: [
          'الجلوس على الأرض مع إسناد أعلى الظهر إلى مقعد ووضع البار المبطّن فوق الوركين.',
          'تثبيت القدمين على الأرض بعرض الوركين مع ثني الركبتين.',
          'الدفع بالكعبين لرفع البار حتى يمتد الوركان بالكامل.',
          'التوقف وشدّ الأرداف في الأعلى ثم النزول بتحكم.',
        ],
      },
      tips: {
        en: [
          'Keep your chin tucked and eyes forward, not up at the ceiling.',
          'At the top your shins should be vertical.',
        ],
        ar: [
          'إبقاء الذقن للداخل والنظر للأمام لا إلى السقف.',
          'في الأعلى يجب أن تكون الساقان عموديتين.',
        ],
      },
      mistakes: {
        en: [
          'Over-arching your lower back at the top.',
          'Placing your feet too far away, which shifts the work to the hamstrings.',
        ],
        ar: [
          'تقويس أسفل الظهر بشكل مبالغ فيه في الأعلى.',
          'إبعاد القدمين كثيرًا مما ينقل العمل إلى أوتار الركبة.',
        ],
      },
    },
    {
      id: 'bulgarian-split-squat',
      muscle: 'glutes',
      location: ['home', 'gym'],
      level: 'advanced',
      type: 'reps',
      equipment: ['bench'],
      perSide: true,
      image: '',
      name: { en: 'Bulgarian Split Squat', ar: 'السكوات البلغاري' },
      steps: {
        en: [
          'Stand about two steps in front of a bench and rest the top of your back foot on it.',
          'Keep your chest up, hands on your hips or holding dumbbells.',
          'Lower straight down until your front thigh is about parallel to the floor.',
          'Push through your front heel to rise back up.',
        ],
        ar: [
          'الوقوف على بُعد خطوتين تقريبًا أمام مقعد ووضع ظهر القدم الخلفية عليه.',
          'إبقاء الصدر مرفوعًا واليدين على الوركين أو حمل دمبل.',
          'النزول بشكل عمودي حتى يصبح الفخذ الأمامي موازيًا للأرض تقريبًا.',
          'الدفع بكعب القدم الأمامية للصعود.',
        ],
      },
      tips: {
        en: [
          'Lean your torso slightly forward to work the glutes more.',
          'At home, a sturdy chair or sofa works well.',
        ],
        ar: [
          'إمالة الجذع قليلًا للأمام لتشغيل الأرداف أكثر.',
          'في المنزل يمكن استخدام كرسي ثابت أو أريكة.',
        ],
      },
      mistakes: {
        en: [
          'Standing too close to the bench, which pushes the knee far past the toes.',
          'Pushing off the back foot instead of the front leg.',
        ],
        ar: [
          'الوقوف قريبًا جدًا من المقعد مما يدفع الركبة كثيرًا أمام أصابع القدم.',
          'الدفع بالقدم الخلفية بدلًا من الساق الأمامية.',
        ],
      },
    },

    /* ---------- Core ---------- */
    {
      id: 'plank',
      muscle: 'core',
      location: ['home', 'gym'],
      level: 'beginner',
      type: 'time',
      equipment: ['mat'],
      image: '',
      name: { en: 'Plank', ar: 'البلانك' },
      steps: {
        en: [
          'Rest on your forearms with elbows under your shoulders.',
          'Step your feet back so your body forms a straight line from head to heels.',
          'Brace your core and squeeze your glutes.',
          'Hold the position while breathing steadily.',
        ],
        ar: [
          'الاستناد على الساعدين مع وضع المرفقين أسفل الكتفين.',
          'مدّ القدمين للخلف حتى يستقيم الجسم من الرأس إلى الكعبين.',
          'شدّ عضلات البطن والأرداف.',
          'الثبات في الوضعية مع التنفس بانتظام.',
        ],
      },
      tips: {
        en: [
          'Push the floor away with your forearms to stay strong through the shoulders.',
          'Too hard? Drop your knees to the floor.',
        ],
        ar: [
          'دفع الأرض بالساعدين للحفاظ على ثبات الكتفين.',
          'للتسهيل: إنزال الركبتين إلى الأرض.',
        ],
      },
      mistakes: {
        en: [
          'Letting the hips sag toward the floor.',
          'Holding your breath.',
        ],
        ar: [
          'ترهّل الوركين نحو الأرض.',
          'حبس النفس.',
        ],
      },
    },
    {
      id: 'bicycle-crunch',
      muscle: 'core',
      location: ['home'],
      level: 'beginner',
      type: 'reps',
      equipment: ['mat'],
      perSide: true,
      image: '',
      name: { en: 'Bicycle Crunch', ar: 'كرنش الدراجة' },
      steps: {
        en: [
          'Lie on your back with hands lightly behind your head and knees lifted to 90°.',
          'Lift your shoulders off the floor.',
          'Bring one elbow toward the opposite knee while straightening the other leg.',
          'Switch sides in a smooth pedaling motion.',
        ],
        ar: [
          'الاستلقاء على الظهر مع وضع اليدين خلف الرأس برفق ورفع الركبتين بزاوية 90°.',
          'رفع الكتفين عن الأرض.',
          'تقريب أحد المرفقين نحو الركبة المعاكسة مع فرد الساق الأخرى.',
          'التبديل بين الجانبين بحركة سلسة تشبه قيادة الدراجة.',
        ],
      },
      tips: {
        en: [
          'Rotate from your ribs, not just your elbows.',
          'Slow down to make every rep count.',
        ],
        ar: [
          'الالتفاف من منطقة الأضلاع وليس بالمرفقين فقط.',
          'الإبطاء لجعل كل تكرار فعّالًا.',
        ],
      },
      mistakes: {
        en: [
          'Pulling on your neck with your hands.',
          'Rushing through reps with tiny movements.',
        ],
        ar: [
          'شدّ الرقبة باليدين.',
          'الاستعجال في التكرارات بحركات صغيرة.',
        ],
      },
    },
    {
      id: 'russian-twist',
      muscle: 'core',
      location: ['home'],
      level: 'intermediate',
      type: 'reps',
      equipment: ['none'],
      perSide: true,
      image: '',
      name: { en: 'Russian Twist', ar: 'الالتواء الروسي' },
      steps: {
        en: [
          'Sit with knees bent and heels on the floor, then lean back to about 45°.',
          'Clasp your hands or hold a weight in front of your chest.',
          'Rotate your torso to bring your hands beside one hip.',
          'Twist to the other side. Each side counts as one rep.',
        ],
        ar: [
          'الجلوس مع ثني الركبتين ووضع الكعبين على الأرض ثم الميل للخلف بزاوية 45° تقريبًا.',
          'تشبيك اليدين أو حمل ثقل أمام الصدر.',
          'لفّ الجذع لإيصال اليدين إلى جانب أحد الوركين.',
          'اللفّ إلى الجانب الآخر، ويُحتسب كل جانب تكرارًا.',
        ],
      },
      tips: {
        en: [
          'Lift your feet off the floor to make it harder.',
          'Turn your shoulders, not just your arms.',
        ],
        ar: [
          'رفع القدمين عن الأرض لزيادة الصعوبة.',
          'تحريك الكتفين وليس الذراعين فقط.',
        ],
      },
      mistakes: {
        en: [
          'Rounding your back as you lean.',
          'Swinging the arms without turning the torso.',
        ],
        ar: [
          'تقوّس الظهر أثناء الميل.',
          'أرجحة الذراعين دون لفّ الجذع.',
        ],
      },
    },
    {
      id: 'hanging-leg-raise',
      muscle: 'core',
      location: ['gym'],
      level: 'advanced',
      type: 'reps',
      equipment: ['pullupBar'],
      image: '',
      name: { en: 'Hanging Leg Raise', ar: 'رفع الأرجل معلّقًا' },
      steps: {
        en: [
          'Hang from a pull-up bar with your arms straight and legs together.',
          'Brace your core and stop any swinging.',
          'Raise your legs until they are parallel to the floor or higher.',
          'Lower slowly without swinging.',
        ],
        ar: [
          'التعلّق بالعقلة مع فرد الذراعين وضمّ الساقين.',
          'شدّ عضلات البطن وإيقاف أي تأرجح.',
          'رفع الساقين حتى تصبحا موازيتين للأرض أو أعلى.',
          'الإنزال ببطء دون تأرجح.',
        ],
      },
      tips: {
        en: [
          'Bend your knees to make it easier.',
          'Curl your pelvis up at the top to fully work the abs.',
        ],
        ar: [
          'ثني الركبتين لتسهيل التمرين.',
          'إمالة الحوض للأعلى في نهاية الحركة لتشغيل عضلات البطن بالكامل.',
        ],
      },
      mistakes: {
        en: [
          'Using momentum to swing the legs up.',
          'Dropping the legs quickly.',
        ],
        ar: [
          'استخدام الاندفاع لأرجحة الساقين.',
          'إسقاط الساقين بسرعة.',
        ],
      },
    },

    /* ---------- Full body ---------- */
    {
      id: 'jumping-jacks',
      muscle: 'fullbody',
      location: ['home'],
      level: 'beginner',
      type: 'time',
      equipment: ['none'],
      image: '',
      name: { en: 'Jumping Jacks', ar: 'القفز مع فتح الأطراف' },
      steps: {
        en: [
          'Stand tall with feet together and arms at your sides.',
          'Jump your feet out wide while raising your arms overhead.',
          'Jump back to the start position.',
          'Keep a steady rhythm.',
        ],
        ar: [
          'الوقوف باستقامة مع ضمّ القدمين والذراعان بجانب الجسم.',
          'القفز مع مباعدة القدمين ورفع الذراعين فوق الرأس.',
          'القفز للعودة إلى وضع البداية.',
          'المحافظة على إيقاع ثابت.',
        ],
      },
      tips: {
        en: [
          'Land softly on the balls of your feet.',
          'Low-impact option: step one foot out at a time instead of jumping.',
        ],
        ar: [
          'الهبوط بخفة على مقدمة القدمين.',
          'خيار منخفض التأثير: إخراج قدم واحدة في كل مرة دون قفز.',
        ],
      },
      mistakes: {
        en: [
          'Landing flat-footed with stiff legs.',
          'Letting your arms stop halfway.',
        ],
        ar: [
          'الهبوط على كامل القدم مع ساقين متصلبتين.',
          'توقف الذراعين في منتصف الحركة.',
        ],
      },
    },
    {
      id: 'mountain-climbers',
      muscle: 'fullbody',
      location: ['home'],
      level: 'intermediate',
      type: 'time',
      equipment: ['none'],
      image: '',
      name: { en: 'Mountain Climbers', ar: 'متسلق الجبل' },
      steps: {
        en: [
          'Start in a high plank with hands under your shoulders.',
          'Drive one knee toward your chest.',
          'Switch legs quickly, as if running in place.',
          'Keep your hips level the whole time.',
        ],
        ar: [
          'البدء بوضعية البلانك العالي مع وضع اليدين أسفل الكتفين.',
          'دفع إحدى الركبتين نحو الصدر.',
          'التبديل بين الساقين بسرعة كالجري في المكان.',
          'إبقاء الوركين في مستوى ثابت طوال الوقت.',
        ],
      },
      tips: {
        en: [
          'Go slower and controlled to focus on your core.',
          'Keep your weight over your hands.',
        ],
        ar: [
          'الأداء ببطء وتحكم للتركيز على عضلات البطن.',
          'إبقاء وزن الجسم فوق اليدين.',
        ],
      },
      mistakes: {
        en: [
          'Bouncing the hips up and down.',
          'Letting your shoulders drift behind your hands.',
        ],
        ar: [
          'رفع الوركين وخفضهما أثناء الحركة.',
          'رجوع الكتفين خلف اليدين.',
        ],
      },
    },
    {
      id: 'kettlebell-swing',
      muscle: 'fullbody',
      location: ['gym'],
      level: 'intermediate',
      type: 'reps',
      equipment: ['kettlebell'],
      image: '',
      name: { en: 'Kettlebell Swing', ar: 'أرجحة الكيتل بل' },
      steps: {
        en: [
          'Stand with feet shoulder-width apart, kettlebell on the floor a little in front of you.',
          'Hinge at the hips, grip the handle with both hands and hike it back between your legs.',
          'Snap your hips forward to swing the bell up to chest height.',
          'Let it swing back down and hinge again for the next rep.',
        ],
        ar: [
          'الوقوف مع مباعدة القدمين بعرض الكتفين ووضع الكيتل بل على الأرض أمام القدمين قليلًا.',
          'الانحناء من الوركين والإمساك بالمقبض باليدين ثم دفعه للخلف بين الساقين.',
          'دفع الوركين للأمام بقوة لأرجحة الكيتل بل حتى مستوى الصدر.',
          'تركه يعود للأسفل والانحناء مجددًا للتكرار التالي.',
        ],
      },
      tips: {
        en: [
          'The power comes from your hips, not your arms.',
          'Squeeze your glutes hard at the top.',
        ],
        ar: [
          'القوة تأتي من الوركين وليس من الذراعين.',
          'شدّ الأرداف بقوة في الأعلى.',
        ],
      },
      mistakes: {
        en: [
          'Squatting down instead of hinging at the hips.',
          'Lifting the bell with your arms or shoulders.',
        ],
        ar: [
          'النزول كالسكوات بدلًا من الانحناء من الوركين.',
          'رفع الكيتل بل بالذراعين أو الكتفين.',
        ],
      },
    },
    {
      id: 'burpee',
      muscle: 'fullbody',
      location: ['home', 'gym'],
      level: 'advanced',
      type: 'reps',
      equipment: ['none'],
      image: '',
      name: { en: 'Burpee', ar: 'البيربي' },
      steps: {
        en: [
          'From standing, squat down and place your hands on the floor.',
          'Jump your feet back into a plank and do a push-up.',
          'Jump your feet back toward your hands.',
          'Explode up into a jump with your arms overhead.',
        ],
        ar: [
          'من وضع الوقوف: النزول ووضع اليدين على الأرض.',
          'القفز بالقدمين للخلف إلى وضعية البلانك وأداء تمرين ضغط.',
          'القفز بالقدمين للأمام نحو اليدين.',
          'القفز للأعلى بقوة مع رفع الذراعين فوق الرأس.',
        ],
      },
      tips: {
        en: [
          'Make it easier by skipping the push-up or stepping back instead of jumping.',
          'Pick a pace you can keep for every rep.',
        ],
        ar: [
          'للتسهيل: حذف تمرين الضغط أو الرجوع خطوة بدلًا من القفز.',
          'اختيار إيقاع يمكن الحفاظ عليه في كل التكرارات.',
        ],
      },
      mistakes: {
        en: [
          'Letting the hips sag in the plank.',
          'Landing hard with locked knees.',
        ],
        ar: [
          'ترهّل الوركين في وضعية البلانك.',
          'الهبوط بقوة مع قفل الركبتين.',
        ],
      },
    },
  ];

  /*
   * Workout fields
   *   gender     'all', 'male' or 'female' (who the workout is featured for)
   *   location   'home' or 'gym'
   *   level      sets/reps inside the workout follow this level
   *   exercises  exercise ids, in order
   */
  const WORKOUTS = [
    {
      id: 'home-starter',
      gender: 'all',
      location: 'home',
      level: 'beginner',
      image: '',
      name: { en: 'Home Starter', ar: 'البداية المنزلية' },
      desc: {
        en: 'A full-body session with no equipment. Perfect for your first weeks.',
        ar: 'حصة لكامل الجسم بدون أدوات، مثالية للأسابيع الأولى.',
      },
      exercises: ['bodyweight-squat', 'push-up', 'glute-bridge', 'superman', 'plank', 'jumping-jacks'],
    },
    {
      id: 'core-crusher',
      gender: 'all',
      location: 'home',
      level: 'intermediate',
      image: '',
      name: { en: 'Core Crusher', ar: 'تحدي البطن' },
      desc: {
        en: 'Four moves that work your abs and obliques from every angle.',
        ar: 'أربع حركات تشغّل عضلات البطن والخواصر من كل الزوايا.',
      },
      exercises: ['bicycle-crunch', 'russian-twist', 'mountain-climbers', 'plank'],
    },
    {
      id: 'upper-body-builder',
      gender: 'male',
      location: 'gym',
      level: 'intermediate',
      image: '',
      name: { en: 'Upper Body Builder', ar: 'بناء الجزء العلوي' },
      desc: {
        en: 'Chest, back, shoulders and arms in one gym session.',
        ar: 'الصدر والظهر والأكتاف والذراعان في حصة واحدة بالنادي.',
      },
      exercises: ['barbell-bench-press', 'lat-pulldown', 'dumbbell-shoulder-press', 'dumbbell-row', 'triceps-pushdown', 'biceps-curl'],
    },
    {
      id: 'strength-day',
      gender: 'male',
      location: 'gym',
      level: 'advanced',
      image: '',
      name: { en: 'Strength Day', ar: 'يوم القوة' },
      desc: {
        en: 'Heavy compound lifts for building raw strength.',
        ar: 'تمارين مركّبة بأوزان ثقيلة لبناء القوة.',
      },
      exercises: ['barbell-back-squat', 'barbell-bench-press', 'pull-up', 'overhead-press'],
    },
    {
      id: 'glute-leg-sculpt',
      gender: 'female',
      location: 'gym',
      level: 'intermediate',
      image: '',
      name: { en: 'Glute & Leg Sculpt', ar: 'نحت الأرداف والأرجل' },
      desc: {
        en: 'A glute-focused gym session that also builds strong legs.',
        ar: 'حصة بالنادي تركّز على الأرداف وتقوّي الأرجل.',
      },
      exercises: ['hip-thrust', 'bulgarian-split-squat', 'leg-press', 'walking-lunge', 'donkey-kick'],
    },
    {
      id: 'home-tone-burn',
      gender: 'female',
      location: 'home',
      level: 'beginner',
      image: '',
      name: { en: 'Home Tone & Burn', ar: 'شدّ وحرق في المنزل' },
      desc: {
        en: 'A quick no-equipment circuit to tone up and raise your heart rate.',
        ar: 'دائرة تمارين سريعة بدون أدوات لشدّ الجسم ورفع نبضات القلب.',
      },
      exercises: ['glute-bridge', 'donkey-kick', 'bodyweight-squat', 'push-up', 'bicycle-crunch', 'jumping-jacks'],
    },
  ];

  /*
   * Store products (no images: cards are typographic)
   *   type      'digital' (downloadable plan) or 'gear' (physical product); drives the shop filter
   *   category  badge on the card: 'program', 'nutrition' or 'equipment'
   *   price     Saudi riyals, all-inclusive
   *   specs     label/value rows shown on the card
   */
  const PRODUCT_TYPES = ['digital', 'gear'];

  const PRODUCTS = [
    {
      id: 'resistance-plan',
      type: 'digital',
      category: 'program',
      price: 49,
      name: { en: 'Complete Resistance Training Plan', ar: 'جدول تمارين مقاومة شامل' },
      desc: {
        en: 'A 12-week progressive plan for home or the gym, with weekly progress sheets.',
        ar: 'برنامج متدرّج لمدة 12 أسبوعاً للمنزل أو النادي، مع جداول متابعة أسبوعية.',
      },
      specs: [
        { en: ['Duration', '12 weeks'], ar: ['المدة', '12 أسبوعاً'] },
        { en: ['Schedule', '4 days a week'], ar: ['الجدول', '4 أيام أسبوعياً'] },
        { en: ['Format', 'Digital PDF'], ar: ['الصيغة', 'ملف PDF رقمي'] },
      ],
    },
    {
      id: 'meal-guide',
      type: 'digital',
      category: 'nutrition',
      price: 39,
      name: { en: 'Meal & Calorie Guide', ar: 'دليل وجبات وسعرات محسوبة' },
      desc: {
        en: 'Simple meals with calories and protein worked out for you, from supermarket ingredients.',
        ar: 'وجبات سهلة محسوبة السعرات والبروتين، بمكونات متوفرة في السوق المحلي.',
      },
      specs: [
        { en: ['Recipes', '60+ meals'], ar: ['الوصفات', 'أكثر من 60 وجبة'] },
        { en: ['Includes', 'Calories and macros'], ar: ['يشمل', 'السعرات والماكروز'] },
        { en: ['Format', 'Digital PDF'], ar: ['الصيغة', 'ملف PDF رقمي'] },
      ],
    },
    {
      id: 'fabric-bands',
      type: 'gear',
      category: 'equipment',
      price: 59,
      name: { en: 'Fabric Resistance Bands', ar: 'حبال مقاومة قماشية' },
      desc: {
        en: 'Three wide loops for glutes and legs that stay in place and don’t roll up.',
        ar: 'طقم من ثلاثة أحزمة عريضة للأرداف والأرجل، تثبت في مكانها ولا تلتف أثناء التمرين.',
      },
      specs: [
        { en: ['Set', '3 resistance levels'], ar: ['الطقم', '3 مستويات مقاومة'] },
        { en: ['Material', 'Stretch fabric with grip'], ar: ['الخامة', 'قماش مرن مانع للانزلاق'] },
      ],
    },
    {
      id: 'exercise-mat',
      type: 'gear',
      category: 'equipment',
      price: 89,
      name: { en: 'Non-slip Exercise Mat', ar: 'سجادة تمارين مانعة للانزلاق' },
      desc: {
        en: 'Grips on both sides and cushions your joints, with a strap to carry it.',
        ar: 'سطح مانع للانزلاق من الجهتين يحمي المفاصل، مع حزام للحمل.',
      },
      specs: [
        { en: ['Size', '183 × 61 cm'], ar: ['المقاس', '183 × 61 سم'] },
        { en: ['Thickness', '6 mm'], ar: ['السماكة', '6 مم'] },
      ],
    },
    {
      id: 'speed-rope',
      type: 'gear',
      category: 'equipment',
      price: 29,
      name: { en: 'Pro Speed Jump Rope', ar: 'حبل قفز احترافي سريع' },
      desc: {
        en: 'A coated steel cable on ball-bearing handles for fast, smooth turns.',
        ar: 'سلك فولاذي مغلّف بمقابض ذات محامل كروية لدوران سريع وسلس.',
      },
      specs: [
        { en: ['Length', 'Adjustable up to 3 m'], ar: ['الطول', 'قابل للتعديل حتى 3 م'] },
        { en: ['Handles', 'Ball bearings'], ar: ['المقابض', 'محامل كروية'] },
      ],
    },
    {
      id: 'shaker',
      type: 'gear',
      category: 'nutrition',
      price: 35,
      name: { en: 'Sports Shaker Bottle', ar: 'شيكر خلط رياضي' },
      desc: {
        en: 'Mixes protein smoothly with a steel whisk ball and a leak-proof lid.',
        ar: 'يخلط البروتين بسلاسة بكرة خلط معدنية وغطاء محكم لا يسرّب.',
      },
      specs: [
        { en: ['Capacity', '700 ml'], ar: ['السعة', '700 مل'] },
        { en: ['Material', 'BPA-free'], ar: ['الخامة', 'خالٍ من BPA'] },
      ],
    },
  ];

  /*
   * Checkout settings
   *   demo         true until a real payment gateway is connected: shows a notice that no payment is taken
   *   orderPrefix  start of the random order number, e.g. GYM-482913
   */
  const CHECKOUT = { demo: true, orderPrefix: 'GYM' };

  return {
    MUSCLES, LOCATIONS, LEVELS, GENDERS, PLANS, FOCUS, EXERCISES, WORKOUTS,
    PRODUCT_TYPES, PRODUCTS, CHECKOUT,
  };
})();
