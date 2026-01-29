import stringSimilarity from "string-similarity";

// ---------- INTENTS ----------
export const intents =[

{
    "intent": "stem_inspires_mission",
    "examples": [
        "What is STEM Inspires' mission?",
        "Can you tell me the mission of STEM Inspires?",
        "What does STEM Inspires aim to do?",
        "Explain the mission of STEM Inspires",
        "What is the goal of STEM Inspires?",
        "Why was STEM Inspires created?",
        "Tell me about STEM Inspires' purpose",
        "What is STEM Inspires trying to achieve?",
        "What does STEM Inspires focus on?",
        "Can you describe STEM Inspires' mission?",
        "What is STEM Inspires' objective?",
        "What is STEM Inspires all about?",
        "Why is STEM Inspires important?",
        "What are STEM Inspires' aims?",
        "What is the purpose behind STEM Inspires?",
        "What does STEM Inspires do for kids?",
        "How does STEM Inspires help children?",
        "What is STEM Inspires' approach to learning?",
        "How does STEM Inspires teach robotics?",
        "What age group does STEM Inspires target?"
    ],
    "responses": [
        "Our mission is to bring FIRST LEGO League (FLL) robotics to children ages 9 to 16, teaching them the basics of robot design, programming, and problem solving through a competitive and engaging hands-on learning experience."
    ]
},{
    "intent": "stem_inspires_vision",
    "examples": [
        "What is STEM Inspires' vision?",
        "Can you tell me the vision of STEM Inspires?",
        "What does STEM Inspires hope to achieve?",
        "Explain the vision of STEM Inspires",
        "What is the long-term goal of STEM Inspires?",
        "What future does STEM Inspires want to create?",
        "What is STEM Inspires striving for?",
        "What is the dream of STEM Inspires?",
        "What is STEM Inspires' ultimate aim?",
        "How does STEM Inspires see the future?",
        "What impact does STEM Inspires want to make?",
        "What does STEM Inspires want for young people?",
        "What is the purpose of STEM Inspires' vision?",
        "How does STEM Inspires inspire youth?",
        "What does STEM Inspires encourage in children?",
        "What is STEM Inspires' approach to STEM confidence?",
        "What kind of future does STEM Inspires imagine?",
        "What is STEM Inspires' goal in robotics?",
        "How does STEM Inspires use robotics to help the world?",
        "What world does STEM Inspires want to create?"
    ],
    "responses": [
        "Our vision is to create a world where young people dream big, develop confidence in STEM, and use robotics to innovate, solve real-world problems, and shape a better future."
    ]
},
{
    "intent": "stem_inspires_testimonials",
    "examples": [
        "What do people say about STEM Inspires?",
        "Can you share reviews about STEM Inspires?",
        "What are testimonials for STEM Inspires?",
        "Who has spoken about STEM Inspires?",
        "What do others think of STEM Inspires?",
        "Can you tell me what people say about STEM Inspires?",
        "Are there any success stories from STEM Inspires?",
        "What are the experiences of students at STEM Inspires?",
        "What do experts say about STEM Inspires?",
        "Any feedback on STEM Inspires programs?",
        "What do parents and students say about STEM Inspires?",
        "Can you share opinions on STEM Inspires?",
        "What have people said about STEM Inspires?",
        "How do people describe STEM Inspires?",
        "Any recommendations for STEM Inspires?",
        "What are some comments from STEM Inspires participants?",
        "What do leaders in STEM education say about STEM Inspires?",
        "How do students feel about STEM Inspires?",
        "What do teachers think about STEM Inspires?",
        "Can you give examples of positive feedback for STEM Inspires?"
    ],
    "responses": [
        "People say wonderful things about STEM Inspires. For example:\n\n- Sandra Kayitaba, Writer for the Digital Transformation Center of Rwanda, says: “Robotics education is a critical component of STEM education in Rwanda, preparing students for a digital future, fostering innovation and creativity.”\n\n- Olajide Ade Ajayi, Regional Coordinator of FLL and Founder of Coderina, says: “The enthusiasm and dedication shown by the participating teams are a testament to the potential of the young people in Africa.”\n\n- Celestine Ineza, a STEM Inspires student, says: “I had no idea how robots worked when I first joined the robotics team, but now I can put up a program and run it myself or with my team.”"
    ]
},
{
    "intent": "fll_program_info",
    "examples": [
        "How can I bring FIRST LEGO League to my school?",
        "I want to participate in the FLL program",
        "Can STEM Inspires help my school join FLL?",
        "How do I start a robotics team at school?",
        "I’m interested in starting a FIRST LEGO League team",
        "How do we get FLL at our school?",
        "Who can help us join the FLL program?",
        "Can I contact a mentor for FLL?",
        "How do I get students involved in FLL?",
        "How can my school participate in FIRST LEGO League?",
        "What are the steps to join FLL?",
        "Can STEM Inspires support our FLL team?",
        "I want to start a robotics team for my students",
        "How can I help students join FLL?",
        "How do we grow the FLL vision at our school?",
        "Can I sponsor a robotics team?",
        "How do we get kits and mentorship for FLL?",
        "What does sponsoring a team involve?",
        "How do I contribute to STEM Inspires’ robotics program?",
        "I want to enable students to participate in robotics competitions"
    ],
    "responses": [
        "If you’re interested in bringing the FIRST LEGO League (FLL) program to your school, contact us and a mentor will get in touch with you. You can start a team to help a new generation of aspiring engineers, or become a sponsor to support students with kits, mentorship, and competition access."
    ]
},
{
    "intent": "share_ideas",
    "examples": [
        "How can I share ideas for LEGO League?",
        "I have ideas for this year's FLL theme",
        "Can I suggest ideas for the robotics team?",
        "How do I contribute my ideas to STEM Inspires?",
        "I want to share my FLL theme suggestions",
        "Where can I submit my ideas for LEGO League?",
        "Can I send ideas to help the teams?",
        "I have cool robotics ideas to share",
        "How do I share creative ideas for FLL?",
        "Can I participate by sharing my ideas?",
        "Where do I share my concepts for robotics?",
        "I want to inspire the teams with my ideas",
        "Can I help by giving suggestions?",
        "How can I contribute ideas to the teams?",
        "Can I submit ideas for this year’s theme?"
    ],
    "responses": [
        "If you have cool ideas for this year's LEGO League theme, you can share them with our teams to inspire and guide their projects."
    ]
}
,{
    "intent": "donate_lego_pieces",
    "examples": [
        "Can I send used LEGO pieces?",
        "I have retired LEGO devices or tools",
        "How do I donate LEGO kits?",
        "Where can I send my old LEGO pieces?",
        "Can I give used robotics tools to STEM Inspires?",
        "I want to donate LEGO sets",
        "How do I send LEGO materials to the teams?",
        "Is there a way to contribute used LEGO pieces?",
        "Can I help by giving retired LEGO items?",
        "Where should I send my old robotics equipment?",
        "I want to recycle my LEGO pieces for STEM Inspires",
        "How can I provide used tools for the program?",
        "Can I contribute my retired LEGO devices?",
        "I have spare LEGO pieces to give",
        "Can I support STEM Inspires by sending LEGO kits?"
    ],
    "responses": [
        "If you have retired LEGO devices or tools, you can contact us via the form to donate them and support our teams."
    ]
}
,{
    "intent": "volunteer_in_rwanda",
    "examples": [
        "How can I help on site in Rwanda?",
        "I want to volunteer with STEM Inspires",
        "Can I join the robotics team in Rwanda?",
        "Where can I volunteer for LEGO League?",
        "I want to help build robots with the team",
        "How do I get involved on site?",
        "Can I support STEM Inspires in person?",
        "I live in Rwanda and want to help",
        "Is there a way to volunteer locally?",
        "How can I assist the teams directly?",
        "I want to contribute by helping hands-on",
        "Where can I join STEM Inspires activities?",
        "Can I participate in building robots?",
        "How do I sign up to volunteer in Rwanda?",
        "I want to help STEM Inspires in person"
    ],
    "responses": [
        "If you live in Rwanda, you can join us on site and help build with the team. Let us know if you want to volunteer!"
    ]
}
,{
    "intent": "fll_program_overview",
    "examples": [
        "What is the FIRST LEGO League?",
        "Tell me about FIRST LEGO League",
        "Can you explain FLL?",
        "What does FIRST LEGO League do?",
        "Who can participate in FIRST LEGO League?",
        "What age group is FLL for?",
        "How does FLL teach STEM?",
        "What skills do students learn in FIRST LEGO League?",
        "How does FIRST LEGO League work?",
        "Can you describe the FLL program?",
        "What is the goal of FIRST LEGO League?",
        "How do students benefit from FLL?",
        "What makes FIRST LEGO League unique?",
        "Where is FLL being introduced in Africa?",
        "Which schools are connected to FLL?",
        "How can children join FIRST LEGO League?",
        "What kind of projects do students do in FLL?",
        "Why is FIRST LEGO League important?",
        "How does FLL prepare students for the future?",
        "Tell me about the FLL robotics program"
    ],
    "responses": [
        "FIRST LEGO League (FLL) introduces science, technology, engineering, and math (STEM) to children ages 9–16 through fun and exciting hands-on learning. Participants gain real-world problem-solving experiences through a guided, global robotics program, helping students and teachers build a better future together. We are bringing this program to Central Africa, connecting schools across the region."
    ]
}
,{
    "intent": "fll_connected_schools",
    "examples": [
        "Which schools are part of FIRST LEGO League?",
        "What schools are connected to FLL?",
        "Can you list the schools participating in FLL?",
        "Which schools are joining the robotics program?",
        "What schools are involved in FIRST LEGO League?",
        "Where is FLL being introduced?",
        "Which schools in Central Africa have FLL teams?",
        "Tell me the names of schools connected to FLL",
        "What schools are taking part in FLL activities?",
        "Which schools are collaborating with STEM Inspires for FLL?",
        "Can you show me FLL schools?",
        "How many schools are participating in FIRST LEGO League?",
        "What schools are engaged in robotics through FLL?",
        "Which schools have STEM Inspires robotics teams?",
        "List the schools involved in FLL",
        "Which schools are supported by STEM Inspires for FLL?",
        "Can you tell me about FLL partner schools?",
        "What schools are currently connected to FLL?",
        "Where can I find participating FLL schools?",
        "Which schools are building robots with FLL?"
    ],
    "responses": [
        "We are connecting several schools in Central Africa to the FIRST LEGO League program. You can contact us to find out which schools are participating or to get involved with a local team."
    ]
}
,
{
    "intent": "fll_discovering_interest",
    "examples": [
        "How do schools learn about FIRST LEGO League?",
        "How does STEM Inspires introduce FLL to schools?",
        "What is the first step to get a school involved?",
        "How do students and parents find out about FLL?",
        "How do you share FLL with schools?",
        "How does STEM Inspires discover interest in FLL?",
        "What do schools need to know about FIRST LEGO League?",
        "How do students get excited about FLL?",
        "How is FLL presented to schools and governments?",
        "How do kids learn about the FLL opportunity?",
        "What is the process for introducing FLL to a school?",
        "How do parents hear about robotics at school?",
        "How do you promote FLL in local schools?",
        "How are schools contacted for FLL?",
        "How do students express interest in FLL?",
        "What is the first step to join FLL?",
        "How does STEM Inspires get schools interested?",
        "How do you tell schools about robotics programs?",
        "How do students learn about STEM Inspires' project?",
        "How do schools get to know about FLL teams?"
    ],
    "responses": [
        "The first step in recruiting schools is discovering interest. STEM Inspires shares what FIRST LEGO League is about with schools, students, and governments. Often, parents say their kids have been waiting for an opportunity like this at their school."
    ]
}
,{
    "intent": "fll_addressing_roadblocks",
    "examples": [
        "What if a school lacks resources for FLL?",
        "How do you handle schools far from the city?",
        "Can STEM Inspires help schools without internet?",
        "What support is given to schools with roadblocks?",
        "How do you fix problems preventing a team?",
        "How are schools assisted in starting FLL teams?",
        "What happens if a school can’t afford kits?",
        "How does STEM Inspires support remote schools?",
        "How do you overcome challenges for FLL participation?",
        "Do you provide workshops for team coaches?",
        "How do you help schools build robotics teams?",
        "What solutions are offered for resource-limited schools?",
        "How do schools get help starting FLL teams?",
        "How do you manage obstacles for FLL participation?",
        "Can schools get assistance to join FLL?",
        "What does STEM Inspires do when a school faces challenges?",
        "How are roadblocks handled in FLL recruitment?",
        "How do you ensure schools can participate despite challenges?",
        "Do you help train coaches for FLL?",
        "How is STEM Inspires improving access to FLL?"
    ],
    "responses": [
        "Whether a school is far from the city, lacks internet, or doesn’t have resources to start a team, STEM Inspires addresses these roadblocks. We also host capacity-building workshops for coaches to enhance their abilities to support the teams they manage."
    ]
}
,{
    "intent": "fll_getting_started",
    "examples": [
        "How does STEM Inspires start a team?",
        "What is the process for starting FLL?",
        "How do students join FIRST LEGO League?",
        "What happens when a school decides to participate?",
        "How is FLL presented to students?",
        "How do you get students excited about FLL?",
        "What are the first steps for a new team?",
        "How does STEM Inspires introduce FLL to students?",
        "How is the program explained to kids?",
        "What do presentations for FLL include?",
        "How do you engage students in robotics?",
        "How is interest turned into action for FLL?",
        "How do students start building robots?",
        "How do you kick off a new FLL team?",
        "What is included in the STEM Inspires FLL presentation?",
        "How do you highlight learning and community experiences?",
        "How do students understand the benefits of FLL?",
        "How does STEM Inspires gather excitement for FLL?",
        "What is the first session like for students?",
        "How do kids see the value of joining FLL?"
    ],
    "responses": [
        "STEM Inspires meets with students and presents the FIRST LEGO League. The presentation highlights the learning and community experiences every member will have if they join, creating excitement and interest in getting started."
    ]
},
{
    "intent": "fll_continuous_support",
    "examples": [
        "Does STEM Inspires support teams after they start?",
        "How do you help students build robots?",
        "What support is given to new FLL teams?",
        "Do team leaders get guidance?",
        "How do students get help learning robotics?",
        "Does STEM Inspires provide mentorship?",
        "How is the first few months of FLL supported?",
        "What help is available for students and coaches?",
        "How do you support team management?",
        "What resources are provided to teams?",
        "Do you assist in robot design and programming?",
        "How do students get guidance during FLL?",
        "Is there ongoing support for new teams?",
        "How do you ensure students succeed in FLL?",
        "What help is given during the first months of learning?",
        "How does STEM Inspires manage team challenges?",
        "How do coaches get support from STEM Inspires?",
        "Are teams assisted throughout the learning process?",
        "How do you maintain communication with team leaders?",
        "How does STEM Inspires help teams stay on track?"
    ],
    "responses": [
        "Learning how to build robots isn't easy. STEM Inspires provides continuous support through direct communication with team leaders, helping with development, building, education, and management during the first months of learning."
    ]
},{
    "intent": "fll_build_excited_children",
    "examples": [
        "How does STEM Inspires build excitement in children?",
        "How do students get excited about FLL?",
        "How do you motivate kids to join the robotics program?",
        "What is done to engage students in FLL?",
        "How do you generate interest among students?",
        "How does STEM Inspires prepare children for robotics?",
        "How are schools visited for FLL?",
        "What is done to get teachers and heads of school on board?",
        "How do you ensure students commit to FLL?",
        "How do you inspire students to participate?",
        "What steps are taken to excite children about robotics?",
        "How are students introduced to FLL?",
        "How do you showcase the FLL program to schools?",
        "How do you make kids eager to join the program?",
        "How is excitement generated for FLL teams?",
        "How do you encourage student participation?",
        "What is done to engage the school community?",
        "How do you make students ready to commit?",
        "How are children motivated for robotics competitions?",
        "How do you get teachers and students involved in FLL?"
    ],
    "responses": [
        "STEM Inspires builds excitement by visiting schools to showcase the FLL program. We talk to heads of school, teachers, and students to generate a vision for what’s possible and ensure everyone is ready to commit 100%."
    ]
},
{
    "intent": "fll_build_resources",
    "examples": [
        "How does STEM Inspires provide resources for FLL?",
        "What support is given to schools that can't afford kits?",
        "How do schools get starter kits for FLL?",
        "Does STEM Inspires provide expansion sets and mats?",
        "How are schools supported financially or with materials?",
        "What resources do teams get to start FLL?",
        "Can STEM Inspires help with competition materials?",
        "How do schools receive robotics kits?",
        "What does STEM Inspires donate to new teams?",
        "How are resource-limited schools supported?",
        "How do you ensure schools have necessary materials?",
        "What do you provide for schools joining FLL?",
        "Do teams get help with kits and competition sets?",
        "How are schools equipped for robotics competitions?",
        "How does STEM Inspires support schools with limited budgets?",
        "What materials are provided to schools?",
        "How do students get the tools they need?",
        "What resources help teams succeed in FLL?",
        "How do you make sure schools can participate?",
        "What is included in the resource support for FLL?"
    ],
    "responses": [
        "STEM Inspires builds the resource base by donating starter kits, expansion sets, and competition mats to schools that are interested in the competition but can’t afford them on their own."
    ]
},
{
    "intent": "fll_build_engineers",
    "examples": [
        "How does STEM Inspires develop engineers?",
        "How do teams reach their full potential?",
        "What kind of support is given to students in FLL?",
        "Are mentoring sessions provided for teams?",
        "How do you help teams improve continuously?",
        "What online resources are shared with teams?",
        "How often do mentors meet with teams?",
        "How do students get guidance on robotics?",
        "How does STEM Inspires ensure learning success?",
        "What support is given to engineers in training?",
        "How are students helped to build skills?",
        "How do you host mentoring sessions?",
        "How do teams get technical support?",
        "How do you ensure teams achieve their goals?",
        "How do students develop STEM and robotics skills?",
        "What ongoing support is provided?",
        "How do teams improve through STEM Inspires?",
        "How do students benefit from mentoring sessions?",
        "How are engineers nurtured in FLL?",
        "What steps are taken to develop young engineers?"
    ],
    "responses": [
        "STEM Inspires builds engineers through continuous support, hosting mentoring sessions, sharing online resources, and meeting with the team weekly to help them reach their full potential."
    ]
}
,{
    "intent": "fll_take_to_your_school",
    "examples": [
        "How can I bring FLL to my school?",
        "I want to start a FIRST LEGO League team",
        "How do schools participate in FLL?",
        "Can STEM Inspires help my school join FLL?",
        "What are the steps to start a robotics team?",
        "Who can I contact to bring FLL to my school?",
        "How do we get students involved in FLL?",
        "How do we join the FIRST LEGO League program?",
        "Can my school get support for FLL?",
        "How do we start participating in FLL?",
        "What is required to bring FLL to a school?",
        "How can we initiate a robotics program?",
        "Where do I get mentorship for starting a team?",
        "How do we start building robots at school?",
        "Who helps schools join FIRST LEGO League?",
        "What support is available to new FLL schools?",
        "How do we get starter kits for our school?",
        "Can STEM Inspires guide schools in FLL?",
        "How do we implement FLL at our school?",
        "How do students start learning robotics through FLL?"
    ],
    "responses": [
        "If you want to take FIRST LEGO League to your school, STEM Inspires can help you start a team, provide resources, and guide students through the program to ensure success."
    ]
}
,{
    "intent": "donation_options",
    "examples": [
        "How can I donate to STEM Inspires?",
        "What donation options are available?",
        "Can I give a one-time donation?",
        "How do I make a monthly contribution?",
        "What amounts can I donate?",
        "Can I fund a student?",
        "How do I start a team with a donation?",
        "Is there a way to fund a whole team?",
        "Can I enter a custom donation amount?",
        "What does a $10 donation do?",
        "What is included in a $100 donation?",
        "How much does it cost to kit-start a team?",
        "How can I support a team with $2000?",
        "Can I choose how much to donate?",
        "Are there recurring donation options?",
        "What are the benefits of monthly donations?",
        "Can I donate to STEM Inspires online?",
        "How do I contribute to student programs?",
        "How do I fund STEM Inspires projects?",
        "What are the donation tiers for STEM Inspires?"
    ],
    "responses": [
        "You can choose to make a one-time or monthly donation. Options include:\n- $10 — 1-time transport\n- $100 — Fund a student\n- $510 — “Kit-Start” a team\n- $2000 — Fund a team\n- Custom amount — donate any amount you choose."
    ]
}
,{
    "intent": "stem_inspires_commitment",
    "examples": [
        "What is STEM Inspires' commitment?",
        "How is STEM Inspires committed to students?",
        "What does STEM Inspires stand for?",
        "Can you explain STEM Inspires' mission regarding teams?",
        "How does STEM Inspires support STEM education?",
        "What is the company’s approach to mentoring teams?",
        "How does STEM Inspires help teams achieve excellence?",
        "What is STEM Inspires’ goal for students?",
        "How does STEM Inspires foster an inclusive environment?",
        "What support does STEM Inspires provide to schools?",
        "How does STEM Inspires guide teams in competitions?",
        "What resources does STEM Inspires offer?",
        "How does STEM Inspires develop students' skills?",
        "What does STEM Inspires do for championship-level performance?",
        "How does STEM Inspires encourage innovation?",
        "What is STEM Inspires’ philosophy for learning?",
        "How does STEM Inspires motivate students?",
        "What is STEM Inspires’ promise to teams?",
        "How does STEM Inspires create opportunities for excellence?",
        "What makes STEM Inspires committed to STEM education?"
    ],
    "responses": [
        "STEM Inspires is committed to empowering teams to achieve excellence in STEM. We provide mentorship, resources, and guidance to schools and student groups, creating an inclusive and motivating environment for teams to learn, innovate, and reach championship-level performance."
    ]
}
,
{
    "intent": "stem_inspires_commitment_short",
    "examples": [
        "What is STEM Inspires committed to?",
        "How does STEM Inspires help teams?",
        "What support does STEM Inspires offer?",
        "Can you explain STEM Inspires' goal?",
        "How does STEM Inspires empower students?",
        "What does STEM Inspires do for teams?",
        "How does STEM Inspires encourage learning?",
        "What is STEM Inspires’ promise?",
        "How does STEM Inspires motivate students?",
        "What is STEM Inspires’ role in STEM education?"
    ],
    "responses": [
        "STEM Inspires helps teams excel in STEM by providing mentorship, resources, and guidance, creating a supportive and motivating environment for learning, innovation, and success."
    ]
}
,{
    "intent": "stem_inspires_champions",
    "examples": [
        "Who are the STEM Inspires champions?",
        "Tell me about the winners of STEM Inspires competitions",
        "Which schools have won FIRST LEGO League?",
        "Who are the national champions?",
        "Can you list past STEM Inspires winners?",
        "Which schools dominated the competitions?",
        "Tell me about GSOB 2025 champions",
        "Who won the 2024 Woman in STEM award?",
        "What school won in 2023?",
        "Can you show the champions gallery?",
        "Which teams excelled in national competitions?",
        "Who are the top STEM Inspires students?",
        "Can you tell me about Christ Roi winners?",
        "Which girls’ schools have won awards?",
        "What schools have achieved national recognition?",
        "Tell me about the champion teams in Rwanda",
        "Who are the leaders in STEM competitions?",
        "Which schools performed best at district and province levels?",
        "Who has been awarded for robotics excellence?",
        "Can you give details of past champions?"
    ],
    "responses": [
        "Here are some of the STEM Inspires champions:\n\n- **G.S.O.B | 2025** (Season: Submerged – 2025): GSOB Indatwa n’Inkesha won the national competition with an outstanding robot design.\n\n- **Christ Roi | 2024** (Season: Masterpiece – 2024): Collège du Christ-Roi de Nyanza rose from second place at the district level to national champions.\n\n- **Maranyundo | 2023** (Season: Energize – 2023): Maranyundo Girls School advanced from fourth at district level to dominate nationals through teamwork and innovation."
    ]
}
,{
    "intent": "first_tech_challenge_intro",
    "examples": [
        "What is the FIRST Tech Challenge?",
        "Tell me about the FIRST Tech Challenge",
        "Can you explain FTC?",
        "How does FTC inspire students?",
        "What is the goal of the FIRST Tech Challenge?",
        "Who can participate in FTC?",
        "How does FTC teach robotics and teamwork?",
        "What skills do students gain from FTC?",
        "How does FTC help with real-world problem solving?",
        "Can you describe the FIRST Tech Challenge program?",
        "Why should students join FTC?",
        "How does FTC develop innovators?",
        "What is included in the FIRST Tech Challenge?",
        "How can students join FTC?",
        "What is the purpose of the FIRST Tech Challenge?",
        "How does FTC support STEM education?",
        "What makes FTC different from other programs?",
        "How do students benefit from joining FTC?",
        "What kind of competitions does FTC involve?",
        "Why is FTC important for young innovators?"
    ],
    "responses": [
        "The FIRST Tech Challenge (FTC) inspires the next generation of innovators through robotics, teamwork, and real-world problem solving. Students can join the challenge to develop their STEM skills and creativity."
    ]
}
,{
    "intent": "ftc_connected_schools",
    "examples": [
        "Which schools are participating in the FIRST Tech Challenge?",
        "Can you list schools connected to FTC?",
        "What schools are involved in FTC?",
        "Which schools are joining the robotics challenge?",
        "Tell me about the schools in FTC",
        "Where is FTC being introduced?",
        "Which schools are taking part in FTC competitions?",
        "Can you name the FTC schools?",
        "Which schools are involved in STEM Inspires FTC program?",
        "What schools are connected to the challenge?",
        "Where are the FTC teams based?",
        "Which schools in Rwanda participate in FTC?",
        "Who are the FTC school partners?",
        "What schools are supported in FTC?",
        "Which schools are building robots for FTC?",
        "Can you show the FTC champions and schools?",
        "Which schools are actively competing in FTC?",
        "What schools are part of STEM Inspires FTC program?",
        "Where can I find schools connected to FTC?",
        "Which schools are part of the robotics challenge?"
    ],
    "responses": [
        "The following schools are connected to the FIRST Tech Challenge (FTC):\n\n- College Saint Andrew, Kigali\n- Christ Roi Nyanza, Rwanda\n- Gashora Girls Academy, Rwanda\n- Maranyundo Girls School, Rwanda"
    ]
}
,{
    "intent": "sisters_in_stem",
    "examples": [
        "Who started STEM Inspires?",
        "Tell me about the founders of STEM Inspires",
        "Who are Amelia and Vienna?",
        "How did STEM Inspires begin?",
        "Who founded STEM Inspires in Rwanda?",
        "Can you explain the story of the sisters in STEM?",
        "Who inspires STEM students through STEM Inspires?",
        "How did Amelia and Vienna start STEM Inspires?",
        "Who are the leaders behind STEM Inspires?",
        "What is the background of STEM Inspires founders?"
    ],
    "responses": [
        "Amelia and Vienna founded STEM Inspires in Rwanda in 2022. Having grown up involved with FIRST, they use their experience to inspire students to embrace the challenge, creativity, and fun of STEM."
    ]
},{
    "intent": "team_amelia_wyler",
    "examples": [
        "Who is Amelia Wyler?",
        "Tell me about Amelia Wyler",
        "What does Amelia Wyler do at STEM Inspires?",
        "Who are the founders of STEM Inspires?",
        "Can you give details about Amelia Wyler?"
    ],
    "responses": [
        "Amelia Wyler is a Founder of STEM Inspires. You can contact her at amelia@steminspires.tech."
    ]
}
,{
    "intent": "team_vienna_wyler",
    "examples": [
        "Who is Vienna Wyler?",
        "Tell me about Vienna Wyler",
        "What does Vienna Wyler do at STEM Inspires?",
        "Can you give details about Vienna Wyler?"
    ],
    "responses": [
        "Vienna Wyler is a Founder of STEM Inspires. You can contact her at vienna@steminspires.tech."
    ]
}
,{
    "intent": "team_happy_herman",
    "examples": [
        "Who is Happy Herman?",
        "Tell me about Happy Herman",
        "What does Happy Herman do at STEM Inspires?",
        "Can you give details about Happy Herman?"
    ],
    "responses": [
        "Happy Herman is the Human Resources Manager at STEM Inspires. You can contact him at happy@steminspires.tech."
    ]
}
,{
    "intent": "team_philemon_mucyo",
    "examples": [
        "Who is Philemon Mucyo?",
        "Tell me about Philemon Mucyo",
        "What does Philemon Mucyo do at STEM Inspires?",
        "Can you give details about Philemon Mucyo?"
    ],
    "responses": [
        "Philemon Mucyo is a Robotics Trainer at STEM Inspires. You can contact him at philemon@steminspires.tech."
    ]
}
,{
    "intent": "team_prudence_ayivi",
    "examples": [
        "Who is Prudence Ayivi?",
        "Tell me about Prudence Ayivi",
        "What does Prudence Ayivi do at STEM Inspires?",
        "Can you give details about Prudence Ayivi?"
    ],
    "responses": [
        "Prudence Ayivi is a STEM Coach at STEM Inspires. You can contact her at prudence@steminspires.tech."
    ]
}
,{
    "intent": "team_fidele_manirafasha",
    "examples": [
        "Who is Fidèle Manirafasha?",
        "Tell me about Fidèle Manirafasha",
        "What does Fidèle Manirafasha do at STEM Inspires?"
    ],
    "responses": [
        "Fidèle Manirafasha is a Robotics Trainer at STEM Inspires."
    ]
}
,{
    "intent": "team_ismael_kaleeba",
    "examples": [
        "Who is Ismael Kaleeba?",
        "Tell me about Ismael Kaleeba",
        "What does Ismael Kaleeba do at STEM Inspires?"
    ],
    "responses": [
        "Ismael Kaleeba is a Student Ambassador at STEM Inspires."
    ]
}
,{
    "intent": "team_jeremie_habumugisha",
    "examples": [
        "Who is Jeremie Habumugisha?",
        "Tell me about Jeremie Habumugisha",
        "What does Jeremie Habumugisha do at STEM Inspires?"
    ],
    "responses": [
        "Jeremie Habumugisha is a Student Mentor at STEM Inspires."
    ]
}
,{
    "intent": "team_ishimwe_yves",
    "examples": [
        "Who is Ishimwe Yves?",
        "Tell me about Ishimwe Yves",
        "What does Ishimwe Yves do at STEM Inspires?"
    ],
    "responses": [
        "Ishimwe Yves is a Student Ambassador at STEM Inspires."
    ]
}
,{
    "intent": "team_alma_power",
    "examples": [
        "Who is Alma Power?",
        "Tell me about Alma Power",
        "What does Alma Power do at STEM Inspires?"
    ],
    "responses": [
        "Alma Power is a Robotics Trainer at STEM Inspires."
    ]
}
,{
    "intent": "team_owen_cooper",
    "examples": [
        "Who is Owen Cooper?",
        "Tell me about Owen Cooper",
        "What does Owen Cooper do at STEM Inspires?"
    ],
    "responses": [
        "Owen Cooper is a Robotics Trainer at STEM Inspires."
    ]
}
,{
    "intent": "greeting",
    "examples": [
        "Hi",
        "Hello",
        "Hey",
        "Good morning",
        "Good afternoon",
        "Good evening",
        "Hi there",
        "Hey, how’s it going?",
        "Hello, how are you?",
        "Hi, ready to chat?"
    ],
    "responses": [
        "Hi! I’m the STEM Inspires assistant. I can help you learn about our programs, teams, events, donations, and more."
    ]
}
,{
    "intent": "farewell",
    "examples": [
        "Bye",
        "Goodbye",
        "See you later",
        "Talk to you soon",
        "Catch you later",
        "Have a nice day",
        "Bye for now"
    ],
    "responses": [
        "Goodbye! Feel free to come back anytime to learn more about STEM Inspires and our programs."
    ]
}
,{
    "intent": "thanks",
    "examples": [
        "Thank you",
        "Thanks",
        "Thanks a lot",
        "Many thanks",
        "Thanks for your help",
        "I appreciate it"
    ],
    "responses": [
        "You’re welcome! Happy to help you learn more about STEM Inspires."
    ]
}
,{
    "intent": "help",
    "examples": [
        "Can you help me?",
        "I need assistance",
        "What can you do?",
        "How can you help me?",
        "I need guidance",
        "What services do you offer?"
    ],
    "responses": [
        "I can provide information about STEM Inspires, our programs like FLL and FTC, donation options, team members, events, and more. Just ask!"
    ]
}
,
 {
        "intent": "about_stem_inspires",
        "examples": [
             "What is STEM Inspires?",
        "Tell me about STEM Inspires",
        "Who runs STEM Inspires?",
        "What does STEM Inspires do?",
        "Can you describe STEM Inspires?",
        "Tell me about your organization",
        "What is STEM Inspires?",
        "Tell me about STEM Inspires",
        "Can you explain STEM Inspires?",
        "Who is STEM Inspires for?",
        "What does STEM Inspires do?",
        "Give me details on STEM Inspires",
        "What is the mission of STEM Inspires?",
        "What is STEM Inspires all about?",
        "Can you describe STEM Inspires?",
        "Tell me more about STEM Inspires",
        "What programs does STEM Inspires offer?",
        "Who does STEM Inspires inspire?",
        "What is the goal of STEM Inspires?",
        "Why was STEM Inspires created?",
        "What is STEM Inspires mission statement?",
        "What kind of curriculum does STEM Inspires have?",
        "What makes STEM Inspires unique?",
        "Can you share info about STEM Inspires?",
        "What is the purpose of STEM Inspires?",
        "What is STEM Inspires known for?",
            "What is STEM Inspires?",
            "Tell me about STEM Inspires",
            "Can you explain STEM Inspires?",
            "Who is STEM Inspires for?",
            "What does STEM Inspires do?",
            "Give me details on STEM Inspires",
            "What is the mission of STEM Inspires?",
            "What is STEM Inspires all about?",
            "Can you describe STEM Inspires?",
            "Tell me more about STEM Inspires",
            "What programs does STEM Inspires offer?",
            "Who does STEM Inspires inspire?",
            "What is the goal of STEM Inspires?",
            "Why was STEM Inspires created?",
            "What is STEM Inspires mission statement?",
            "What kind of curriculum does STEM Inspires have?",
            "What makes STEM Inspires unique?",
            "Can you share info about STEM Inspires?",
            "What is the purpose of STEM Inspires?",
            "What is STEM Inspires known for?",
            // New examples
            "Whats stem inspires?",
            "Info on stem inspires rwanda",
            "Stem inspires in kigali",
            "What is this org about?",
            "Tell about stem inspires nonprofit",
            "Stem inspires overview",
            "Who runs stem inspires?",
            "Stem inspires robotics in rwanda",
            "Explain stem inspires to me",
            "Stem inspires for kids in africa",
            "What do they do in central africa?",
            "Stem inspires background",
            "Is stem inspires a charity?",
            "Stem inspires quick facts",
            "How did stem inspires start?",
            "Stem inspires in 2026",
            "Update on stem inspires",
            "Stem inspires for schools",
            "What is stem inspires focus?",
            "Stem inspires robotics org",
            "Tell me stem inspires story",
            "Stem inspires in rwanda schools",
            "What is stem inspires doing now?",
            "Stem inspires engineering for youth",
            "Overview of stem inspires programs"
        ],
        "responses": [
            "STEM Inspires is a nonprofit focused on inspiring the next generation of innovators through inclusive, exciting, and hands-on robotics curriculums in Rwanda and Central Africa. Founded in 2022 by sisters Amelia and Vienna Wyler, it brings programs like FIRST LEGO League (FLL) to schools to empower young engineers.",
            // New variation
            "As a Rwanda-based nonprofit, STEM Inspires delivers robotics education to build entrepreneurs and tech leaders. Started by Amelia and Vienna in Kigali after their childhood visits, it has launched over 35 FLL teams since 2022."
        ]
    },
    {
        "intent": "stem_inspires_mission",
        "examples": [
            "What is STEM Inspires' mission?",
            "Can you tell me the mission of STEM Inspires?",
            "What does STEM Inspires aim to do?",
            "Explain the mission of STEM Inspires",
            "What is the goal of STEM Inspires?",
            "Why was STEM Inspires created?",
            "Tell me about STEM Inspires' purpose",
            "What is STEM Inspires trying to achieve?",
            "What does STEM Inspires focus on?",
            "Can you describe STEM Inspires' mission?",
            "What is STEM Inspires' objective?",
            "What is STEM Inspires all about?",
            "Why is STEM Inspires important?",
            "What are STEM Inspires' aims?",
            "What is the purpose behind STEM Inspires?",
            "What does STEM Inspires do for kids?",
            "How does STEM Inspires help children?",
            "What is STEM Inspires' approach to learning?",
            "How does STEM Inspires teach robotics?",
            "What age group does STEM Inspires target?",
            // New examples
            "Stem inspires mission statement",
            "Mission of stem inspires rwanda",
            "What do they aim for in kigali?",
            "Stem inspires goals 2026",
            "Explain stem inspires purpose",
            "Stem inspires for youth mission",
            "How stem inspires inspires kids",
            "Stem inspires robotics mission",
            "What is their main aim?",
            "Stem inspires africa mission",
            "Mission behind stem inspires",
            "Stem inspires learning approach",
            "How they help rwandan children",
            "Stem inspires target ages",
            "What kids do they focus on?",
            "Stem inspires problem solving mission",
            "Their mission in central africa",
            "Stem inspires innovation goals",
            "Why create stem inspires?",
            "Stem inspires educational mission",
            "Mission for robotics in schools",
            "Stem inspires hands-on mission",
            "What is stem inspires trying to do now?",
            "Stem inspires competitive learning"
        ],
        "responses": [
            "Our mission is to bring FIRST LEGO League (FLL) robotics to children ages 9 to 16, teaching them the basics of robot design, programming, and problem solving through a competitive and engaging hands-on learning experience in Rwanda and Central Africa."
        ]
    },
    {
        "intent": "stem_inspires_vision",
        "examples": [
            "What is STEM Inspires' vision?",
            "Can you tell me the vision of STEM Inspires?",
            "What does STEM Inspires hope to achieve?",
            "Explain the vision of STEM Inspires",
            "What is the long-term goal of STEM Inspires?",
            "What future does STEM Inspires want to create?",
            "What is STEM Inspires striving for?",
            "What is the dream of STEM Inspires?",
            "What is STEM Inspires' ultimate aim?",
            "How does STEM Inspires see the future?",
            "What impact does STEM Inspires want to make?",
            "What does STEM Inspires want for young people?",
            "What is the purpose of STEM Inspires' vision?",
            "How does STEM Inspires inspire youth?",
            "What does STEM Inspires encourage in children?",
            "What is STEM Inspires' approach to STEM confidence?",
            "What kind of future does STEM Inspires imagine?",
            "What is STEM Inspires' goal in robotics?",
            "How does STEM Inspires use robotics to help the world?",
            "What world does STEM Inspires want to create?",
            // New examples
            "Stem inspires vision statement",
            "Vision for stem inspires rwanda",
            "What future in kigali?",
            "Stem inspires long term vision",
            "Their dream for africa",
            "Stem inspires youth future",
            "How they build confidence in stem",
            "Stem inspires robotics vision",
            "Ultimate goal of stem inspires",
            "Stem inspires world impact",
            "Vision for young rwandans",
            "Stem inspires innovation future",
            "What do they imagine for kids?",
            "Stem inspires global vision",
            "Their approach to youth inspiration",
            "Stem inspires better world",
            "Vision in central africa",
            "Stem inspires engineering dream",
            "How stem inspires shapes future",
            "Stem inspires 2026 vision",
            "What impact on rwanda youth?",
            "Stem inspires problem solving vision",
            "Their goal for competitions",
            "Stem inspires inclusive future"
        ],
        "responses": [
            "Our vision is to create a world where young people dream big, develop confidence in STEM, and use robotics to innovate, solve real-world problems, and shape a better future in places like Rwanda."
        ]
    },
    {
        "intent": "stem_inspires_testimonials",
        "examples": [
            "What do people say about STEM Inspires?",
            "Can you share reviews about STEM Inspires?",
            "What are testimonials for STEM Inspires?",
            "Who has spoken about STEM Inspires?",
            "What do others think of STEM Inspires?",
            "Can you tell me what people say about STEM Inspires?",
            "Are there any success stories from STEM Inspires?",
            "What are the experiences of students at STEM Inspires?",
            "What do experts say about STEM Inspires?",
            "Any feedback on STEM Inspires programs?",
            "What do parents and students say about STEM Inspires?",
            "Can you share opinions on STEM Inspires?",
            "What have people said about STEM Inspires?",
            "How do people describe STEM Inspires?",
            "Any recommendations for STEM Inspires?",
            "What are some comments from STEM Inspires participants?",
            "What do leaders in STEM education say about STEM Inspires?",
            "How do students feel about STEM Inspires?",
            "What do teachers think about STEM Inspires?",
            "Can you give examples of positive feedback for STEM Inspires?",
            // New examples
            "Stem inspires reviews",
            "Testimonials from rwanda",
            "What students say in kigali",
            "Stem inspires success stories 2026",
            "Feedback on stem inspires",
            "Stem inspires participant comments",
            "Experts on stem inspires",
            "Parent opinions stem inspires",
            "Stem inspires robotics reviews",
            "What do they say about fll in rwanda?",
            "Stem inspires positive feedback",
            "Student experiences stem inspires",
            "Recommendations for stem inspires",
            "Stem inspires africa testimonials",
            "How people describe stem inspires",
            "Stem inspires teacher thoughts",
            "Comments from competitions",
            "Stem inspires youth feedback",
            "Success stories from schools",
            "What leaders say about stem inspires",
            "Stem inspires program opinions",
            "Rwanda stem inspires reviews",
            "Testimonials on instagram",
            "Stem inspires mit feedback"
        ],
        "responses": [
            "People say wonderful things about STEM Inspires. For example:\n\n- Sandra Kayitaba, Writer for the Digital Transformation Center of Rwanda, says: “Robotics education is a critical component of STEM education in Rwanda, preparing students for a digital future, fostering innovation and creativity.”\n\n- Olajide Ade Ajayi, Regional Coordinator of FLL and Founder of Coderina, says: “The enthusiasm and dedication shown by the participating teams are a testament to the potential of the young people in Africa.”\n\n- Celestine Ineza, a STEM Inspires student, says: “I had no idea how robots worked when I first joined the robotics team, but now I can put up a program and run it myself or with my team.”\n\nFrom recent events: Participants in the 3rd Rwanda National Robotics Championship praised the progress and excitement",
            // New variation
            "Testimonials highlight impact: In a YouTube video, founder Amelia discusses starting 35 FLL teams in 2022-2023, with students showing enthusiasm"
        ]
    },
    {
  intent: "fll_program_info",
  examples: [
    "How can I bring FIRST LEGO League to my school?",
    "I want to participate in the FLL program",
    "Can STEM Inspires help my school join FLL?",
    "How do I start a robotics team at school?",
    "I’m interested in starting a FIRST LEGO League team",
    "How do we get FLL at our school?",
    "Who can help us join the FLL program?",
    "Can I contact a mentor for FLL?",
    "How do I get students involved in FLL?",
    "How can my school participate in FIRST LEGO League?",
    "What are the steps to join FLL?",
    "Can STEM Inspires support our FLL team?",
    "I want to start a robotics team for my students",
    "How can I help students join FLL?",
    "How do we grow the FLL vision at our school?",
    "Can I sponsor a robotics team?",
    "How do we get kits and mentorship for FLL?",
    "What does sponsoring a team involve?",
    "How do I contribute to STEM Inspires’ robotics program?",
    "I want to enable students to participate in robotics competitions",
    "Bring FLL to a Rwanda school",
    "Start an FLL team in Kigali",
    "Help with FLL in 2026",
    "How do I join the FLL program?",
    "STEM Inspires FLL support",
    "Steps for FLL at school",
    "Mentor for FLL Rwanda",
    "Get kids into FLL",
    "Participate in FLL Rwanda",
    "Sponsor an FLL team",
    "FLL kits and help",
    "Contribute to FLL robotics",
    "Enable robotics competitions",
    "FLL for my students",
    "Grow FLL in Africa",
    "Join FLL with STEM Inspires",
    "FLL team startup",
    "How do I sponsor robotics?",
    "FLL mentorship Rwanda",
    "Students in FLL competitions",
    "Bring LEGO League to school",
    "FLL program participation",
    "STEM Inspires FLL help",
    "Start robotics in Rwanda"
  ],
  responses: [
    "If you’re interested in bringing the FIRST LEGO League (FLL) program to your school in Rwanda, contact us via the form at https://www.steminspires.tech/contact and a mentor will get in touch. You can start a team to help a new generation of aspiring engineers, or become a sponsor to support students with kits, mentorship, and competition access."
  ]
},
{
  intent: "share_ideas",
  examples: [
    "How can I share ideas for LEGO League?",
    "I have ideas for this year's FLL theme",
    "Can I suggest ideas for the robotics team?",
    "How do I contribute my ideas to STEM Inspires?",
    "I want to share my FLL theme suggestions",
    "Where can I submit my ideas for LEGO League?",
    "Can I send ideas to help the teams?",
    "I have cool robotics ideas to share",
    "How do I share creative ideas for FLL?",
    "Can I participate by sharing my ideas?",
    "Where do I share my concepts for robotics?",
    "I want to inspire the teams with my ideas",
    "Can I help by giving suggestions?",
    "How can I contribute ideas to the teams?",
    "Can I submit ideas for this year’s theme?",
    "Share FLL ideas in Rwanda",
    "Ideas for FLL in Kigali",
    "Suggest themes for 2026",
    "Contribute ideas to STEM Inspires",
    "Send robotics suggestions",
    "Share creative FLL concepts",
    "Help teams with ideas",
    "Submit FLL theme ideas",
    "Inspire Rwanda teams",
    "Give FLL suggestions",
    "Ideas for LEGO League",
    "Participate with concepts",
    "STEM Inspires idea sharing",
    "Cool robotics tips",
    "FLL yearly theme ideas",
    "Contribute to teams",
    "Share my robotics thoughts",
    "Ideas for competitions",
    "Help with FLL projects",
    "Submit suggestions in Rwanda"
  ],
  responses: [
    "If you have cool ideas for this year's LEGO League theme, you can share them with our teams to inspire and guide their projects. Use the contact form at https://www.steminspires.tech/contact to submit."
  ]
},
{
  intent: "donate_lego_pieces",
  examples: [
    "Can I send used LEGO pieces?",
    "I have retired LEGO devices or tools",
    "How do I donate LEGO kits?",
    "Where can I send my old LEGO pieces?",
    "Can I give used robotics tools to STEM Inspires?",
    "I want to donate LEGO sets",
    "How do I send LEGO materials to the teams?",
    "Is there a way to contribute used LEGO pieces?",
    "Can I help by giving retired LEGO items?",
    "Where should I send my old robotics equipment?",
    "I want to recycle my LEGO pieces for STEM Inspires",
    "How can I provide used tools for the program?",
    "Can I contribute my retired LEGO devices?",
    "I have spare LEGO pieces to give",
    "Can I support STEM Inspires by sending LEGO kits?",
    "Donate LEGO to Rwanda",
    "Send old LEGO to Kigali",
    "Retired LEGO for 2026",
    "Give LEGO kits to STEM Inspires",
    "Used robotics tools donation",
    "Donate LEGO sets in Africa",
    "Send materials to teams",
    "Contribute old LEGO",
    "Help with retired items",
    "Old equipment for STEM",
    "Recycle LEGO in Rwanda",
    "Provide tools for the program",
    "Contribute devices",
    "Spare LEGO to give",
    "Support with kits",
    "LEGO donation Rwanda",
    "Old LEGO for schools",
    "Donate robotics gear",
    "Send used LEGO",
    "Help STEM Inspires with LEGO"
  ],
  responses: [
    "If you have retired LEGO devices or tools, you can contact us via the form at https://www.steminspires.tech/contact to donate them and support our teams in Rwanda."
  ]
},
{
  intent: "volunteer_in_rwanda",
  examples: [
    "How can I help on site in Rwanda?",
    "I want to volunteer with STEM Inspires",
    "Can I join the robotics team in Rwanda?",
    "Where can I volunteer for LEGO League?",
    "I want to help build robots with the team",
    "How do I get involved on site?",
    "Can I support STEM Inspires in person?",
    "I live in Rwanda and want to help",
    "Is there a way to volunteer locally?",
    "How can I assist the teams directly?",
    "I want to contribute by helping hands-on",
    "Where can I join STEM Inspires activities?",
    "Can I participate in building robots?",
    "How do I sign up to volunteer in Rwanda?",
    "I want to help STEM Inspires in person",
    "Volunteer in Kigali",
    "Help on site in Rwanda in 2026",
    "Join STEM Inspires as a volunteer",
    "Robotics volunteer Rwanda",
    "Build robots as a volunteer",
    "Get involved on site in Africa",
    "Support in person in Kigali",
    "Local volunteer Rwanda",
    "Assist teams directly",
    "Hands-on help STEM",
    "Join activities in Rwanda",
    "Participate in robots",
    "Sign up to volunteer in Kigali",
    "Help in person Rwanda",
    "STEM Inspires local help",
    "Volunteer for FLL Rwanda",
    "On-site support",
    "Rwanda robotics volunteer",
    "Join the team in Kigali",
    "Help build with kids"
  ],
  responses: [
    "If you live in Rwanda (for example in Kigali), you can join us on site and help build with the team. Let us know if you want to volunteer. Use the contact form at https://www.steminspires.tech/contact to get started."
  ]
},
{
  intent: "fll_program_overview",
  examples: [
    "What is the FIRST LEGO League?",
    "Tell me about FIRST LEGO League",
    "Can you explain FLL?",
    "What does FIRST LEGO League do?",
    "Who can participate in FIRST LEGO League?",
    "What age group is FLL for?",
    "How does FLL teach STEM?",
    "What skills do students learn in FIRST LEGO League?",
    "How does FIRST LEGO League work?",
    "Can you describe the FLL program?",
    "What is the goal of FIRST LEGO League?",
    "How do students benefit from FLL?",
    "What makes FIRST LEGO League unique?",
    "Where is FLL being introduced in Africa?",
    "Which schools are connected to FLL?",
    "How can children join FIRST LEGO League?",
    "What kind of projects do students do in FLL?",
    "Why is FIRST LEGO League important?",
    "How does FLL prepare students for the future?",
    "Tell me about the FLL robotics program",
    "What is FLL?",
    "FLL in Rwanda",
    "Explain FLL Kigali",
    "FLL age group 2026",
    "How FLL teaches STEM",
    "Skills from FLL",
    "FLL work description",
    "Goal of FLL",
    "Benefits of FLL Rwanda",
    "What is unique about FLL?",
    "FLL in Africa",
    "Schools for FLL",
    "Join FLL kids",
    "FLL projects",
    "Importance of FLL",
    "FLL future preparation",
    "FLL robotics info",
    "FIRST LEGO League overview",
    "FLL for Rwandan students",
    "What do kids learn in FLL?",
    "FLL program details",
    "FLL in Central Africa",
    "How FLL helps youth",
    "FLL competitions explained"
  ],
  responses: [
    "FIRST LEGO League (FLL) introduces science, technology, engineering, and math (STEM) to children ages 9–16 through fun and exciting hands-on learning. Participants gain real-world problem-solving experiences through a guided, global robotics program, helping students and teachers build a better future together. We are bringing this program to Central Africa, connecting schools across the region."
  ]
},
{
  intent: "fll_connected_schools",
  examples: [
    "Which schools are part of FIRST LEGO League?",
    "What schools are connected to FLL?",
    "Can you list the schools participating in FLL?",
    "Which schools are joining the robotics program?",
    "What schools are involved in FIRST LEGO League?",
    "Where is FLL being introduced?",
    "Which schools in Central Africa have FLL teams?",
    "Tell me the names of schools connected to FLL",
    "What schools are taking part in FLL activities?",
    "Which schools are collaborating with STEM Inspires for FLL?",
    "Can you show me FLL schools?",
    "How many schools are participating in FIRST LEGO League?",
    "What schools are engaged in robotics through FLL?",
    "Which schools have STEM Inspires robotics teams?",
    "List the schools involved in FLL",
    "Which schools are supported by STEM Inspires for FLL?",
    "Can you tell me about FLL partner schools?",
    "What schools are currently connected to FLL?",
    "Where can I find participating FLL schools?",
    "Which schools are building robots with FLL?",
    "FLL schools Rwanda",
    "Connected schools Kigali",
    "List FLL schools 2026",
    "Schools in the FLL program",
    "FLL in Central Africa schools",
    "Names of FLL schools",
    "FLL activities schools",
    "Collaborating schools STEM",
    "Show FLL schools",
    "How many FLL schools?",
    "Engaged robotics schools",
    "STEM Inspires teams schools",
    "Involved FLL schools",
    "Supported schools FLL",
    "FLL partner schools",
    "Current FLL schools",
    "Participating schools list",
    "Building robots schools",
    "Rwanda FLL schools",
    "Schools with FLL teams",
    "FLL in 100 schools?",
    "STEM Inspires school partners",
    "FLL Rwanda list"
  ],
  responses: [
    "We are connecting several schools in Central Africa to the FIRST LEGO League program. Contact us at https://www.steminspires.tech/contact to find out which schools are participating or to get involved with a local team."
  ]
},
{
  intent: "team_amelia_wyler",
  examples: [
    "Who is Amelia Wyler?",
    "Tell me about Amelia Wyler",
    "What does Amelia Wyler do at STEM Inspires?",
    "Can you give details about Amelia Wyler?",
    "Amelia Wyler bio",
    "Founder Amelia Rwanda",
    "Amelia STEM Inspires",
    "Details on Amelia Wyler",
    "Amelia Wyler role",
    "Who is Amelia founder?",
    "Amelia in Kigali",
    "Amelia Wyler contact",
    "Bio of Amelia",
    "Amelia STEM story"
  ],
  responses: [
    "Amelia Wyler is a founder of STEM Inspires. You can contact her at amelia@steminspires.tech."
  ]
},
{
  intent: "stem_inspires_mit_partnership",
  examples: [
    "What is STEM Inspires x MIT?",
    "Tell me about the MIT collaboration",
    "How does STEM Inspires work with MIT?",
    "Explain the MIT partnership",
    "What is the goal of STEM Inspires x MIT?",
    "Who participates in the MIT program?",
    "How does MIT help Rwandan students?",
    "What skills are taught in MIT mentorship?",
    "Tell me about MIT visits to Rwanda",
    "What is the IAP program with MIT?",
    "Benefits of STEM Inspires MIT partnership",
    "How to get involved in MIT robotics?",
    "MIT students in Rwanda schools",
    "STEM Inspires and MIT outcomes",
    "What is hands-on training with MIT?",
    "MIT mentorship for high schoolers",
    "STEM Inspires x MIT details",
    "Innovation through MIT partnership",
    "Economic growth from the MIT program",
    "Community pride in MIT collaboration",
    "MIT role models for Rwandan youth",
    "Entrepreneurial projects with MIT",
    "Teamwork in MIT sessions",
    "MIT IAP term in Rwanda",
    "Future leaders inspired by MIT"
  ],
  responses: [
    "STEM Inspires partners with MIT to connect Rwandan high school students with MIT undergraduates during their IAP term. Over two weeks, MIT students visit schools to mentor in robot design, programming, entrepreneurial projects, and teamwork through programs like FLL and FTC."
  ]
},
{
  intent: "national_robotics_championship",
  examples: [
    "What is the National Robotics Championship?",
    "Tell me about Rwanda National Robotics Championship",
    "When is the robotics championship?",
    "Details on the 3rd Annual Robotics Championship",
    "Who won the national robotics event?",
    "How to participate in the robotics championship?",
    "What happens at Rwanda robotics championship?",
    "National championship for FLL",
    "Rwanda robotics event info",
    "Championship teams and progress",
    "3rd edition robotics championship",
    "National robotics in Kigali",
    "Robotics championship 2026",
    "STEM Inspires national event",
    "Rwanda championship highlights",
    "Participating in national robotics",
    "Championship pride and teams",
    "National robotics competition",
    "FLL national championship Rwanda",
    "Robotics event in Intare Arena"
  ],
  responses: [
    "The Rwanda National Robotics Championship is an annual event that brings together teams from across Rwanda for robot challenges, teamwork, and innovation. Follow STEM Inspires channels for announcements and highlights."
  ]
},
{
  intent: "ai_hackathon",
  examples: [
    "What is the FLL AI Hackathon?",
    "Tell me about AI Hackathon 2025",
    "Rwanda young innovators in AI Hackathon",
    "Details on FIRST LEGO League AI Hackathon",
    "Who shines at AI Hackathon?",
    "How to join AI Hackathon?",
    "AI Hackathon in Rwanda",
    "FLL AI event info",
    "Hackathon for robotics",
    "AI Hackathon 2026",
    "STEM Inspires AI hackathon",
    "Rwanda AI hackathon highlights",
    "Participate in AI hackathon",
    "AI hackathon boot camp",
    "Students in AI hackathon",
    "AI Hackathon grand finale",
    "FLL AI competition",
    "Rwanda AI innovators",
    "Hackathon with REB",
    "AI hackathon live"
  ],
  responses: [
    "The FIRST LEGO League AI Hackathon is an event where students collaborate, learn, and compete using AI ideas and problem-solving. STEM Inspires and partners share official details and participation steps through their announcements."
  ]
},
{
  intent: "stem_inspires_social_media",
  examples: [
    "What is STEM Inspires Instagram?",
    "Tell me about social media for STEM Inspires",
    "Where to follow STEM Inspires?",
    "STEM Inspires on Instagram",
    "LinkedIn for STEM Inspires",
    "YouTube channel STEM Inspires",
    "Social handles for STEM Inspires",
    "Follow STEM Inspires online",
    "STEM Inspires videos",
    "Instagram photos STEM Inspires",
    "LinkedIn company page",
    "YouTube Rwanda project",
    "STEM Inspires online presence",
    "Social media updates",
    "Follow on Instagram",
    "STEM Inspires posts",
    "Online channels STEM",
    "Social for robotics",
    "STEM Inspires reels",
    "Follow in Rwanda"
  ],
  responses: [
    "You can follow STEM Inspires on social media for updates about programs and events. Check Instagram for photos and videos, LinkedIn for professional updates, and YouTube for longer videos and project highlights."
  ]
},
{
  intent: "stem_inspires_events_overview",
  examples: [
    "What events does STEM Inspires host?",
    "Tell me about STEM Inspires events",
    "Upcoming events for STEM Inspires",
    "Robotics events in Rwanda",
    "Championships by STEM Inspires",
    "FLL competitions overview",
    "Events like hackathons",
    "National events STEM Inspires",
    "Rwanda robotics events",
    "STEM Inspires calendar",
    "Competitions in 2026",
    "Events with partners",
    "Grand finale events",
    "STEM Inspires tournaments",
    "Events for schools",
    "International championship",
    "Events second edition",
    "STEM Inspires live events",
    "Hackathon and finale",
    "Events in Intare Arena"
  ],
  responses: [
    "STEM Inspires hosts events such as robotics championships, hackathons, training sessions, and competitions connected to programs like FIRST LEGO League (FLL) and FIRST Tech Challenge (FTC). Follow their official announcements for dates and locations."
  ]
},
{
  intent: "stem_inspires_contact",
  examples: [
    "How to contact STEM Inspires?",
    "Contact info for STEM Inspires",
    "Where to reach out?",
    "STEM Inspires email",
    "Contact form details",
    "How to inquire about programs?",
    "Get in touch with STEM",
    "Contact for starting a team",
    "Volunteer contact",
    "General questions contact",
    "STEM Inspires support",
    "Reach out Rwanda",
    "Contact in Kigali",
    "Submit message STEM",
    "Contact for donations",
    "Inquire about FLL",
    "STEM Inspires help",
    "Contact mentors",
    "Send email STEM",
    "Contact page info"
  ],
  responses: [
    "To contact STEM Inspires, use the contact form at https://www.steminspires.tech/contact. You can send your name, email, subject, and message there. For some team members, you may also find direct emails on official channels."
  ]
}


];

// ---------- TEXT NORMALIZATION ----------
const normalizeText = (text) =>
  text.toLowerCase().replace(/[^\w\s]/gi, '').trim();

// Precompute normalized examples for faster similarity search
intents.forEach((intent) => {
  intent.normalizedExamples = intent.examples.map(normalizeText);
});

// ---------- FIND BEST INTENT ----------
export const findBestIntentAdvanced = (input) => {
  const normalizedInput = normalizeText(input);
  let bestMatch = null;
  let highestScore = 0;

  intents.forEach((intent) => {
    const match = stringSimilarity.findBestMatch(normalizedInput, intent.normalizedExamples);
    if (match.bestMatch.rating > highestScore) {
      highestScore = match.bestMatch.rating;
      bestMatch = intent;
    }
  });

  return highestScore > 0.4 ? bestMatch : null;
};

// ---------- GET RANDOM RESPONSE ----------
export const getResponse = (input) => {
  const intent = findBestIntentAdvanced(input);
  if (!intent) return "Sorry, I didn't understand that. Can you rephrase?";
  const responses = intent.responses;
  return responses[Math.floor(Math.random() * responses.length)];
};
