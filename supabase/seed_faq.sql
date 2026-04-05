-- ============================================================
-- ComfySeniors.com — Seed FAQ Questions
-- 15 questions from CLAUDE.md § 6.5
-- ============================================================

insert into faq_questions (question, answer, category, order_index) values

-- Understanding care types
(
  'What''s the difference between assisted living and a nursing home?',
  'Assisted living is for seniors who need help with daily activities like bathing, dressing, and medication management but don''t require round-the-clock medical care. Nursing homes (also called skilled nursing facilities) provide 24/7 medical supervision by licensed nurses for seniors with serious health conditions, chronic illnesses, or recovery needs after hospitalization. In New Jersey, assisted living facilities are licensed by the Department of Health and must meet specific staffing and care standards.',
  'Understanding care types',
  1
),
(
  'What is memory care and when is it needed?',
  'Memory care is a specialized type of senior living designed for people with Alzheimer''s disease, dementia, or other cognitive impairments. These communities offer secure environments to prevent wandering, structured daily routines, and staff trained in dementia care techniques. Memory care is typically needed when a loved one can no longer safely live at home or in a standard assisted living facility due to confusion, wandering behavior, or the inability to manage daily tasks independently.',
  'Understanding care types',
  8
),
(
  'What''s the difference between independent and assisted living?',
  'Independent living communities are for active seniors who can manage daily life on their own but want a maintenance-free lifestyle with social activities and amenities. Assisted living adds hands-on personal care support — help with bathing, dressing, meals, medication management, and other daily activities. Independent living residents typically live in apartments or cottages, while assisted living provides more structured support with trained caregivers available around the clock.',
  'Understanding care types',
  10
),
(
  'What is a CCRC?',
  'A CCRC (Continuing Care Retirement Community) is a senior living campus that offers multiple levels of care in one location — typically independent living, assisted living, and skilled nursing. Residents can transition between care levels as their needs change without moving to a new facility. CCRCs usually require a significant entrance fee plus monthly charges. In New Jersey, CCRCs are regulated by the Department of Community Affairs.',
  'Understanding care types',
  12
),

-- Costs & paying for care
(
  'How much does assisted living cost in New Jersey?',
  'The average cost of assisted living in New Jersey ranges from approximately $5,000 to $8,000 per month, though prices vary significantly by location, level of care needed, and facility amenities. North Jersey and areas near New York City tend to be more expensive. Some facilities offer tiered pricing based on the amount of personal care assistance required. Always ask for a complete fee schedule including any additional charges for medication management or higher levels of care.',
  'Costs & paying for care',
  2
),
(
  'How do I pay for senior care if I can''t afford it?',
  'Several options exist for families who need help paying for senior care in New Jersey. NJ Medicaid (through the MLTSS program) covers nursing home care and may help with assisted living costs for eligible residents. Veterans may qualify for VA Aid and Attendance benefits. Long-term care insurance policies cover many types of senior care. Some families use a combination of Social Security income, pension benefits, savings, and the sale of a home. New Jersey''s ADRC (Aging and Disability Resource Connection) at 1-877-222-3737 can help you explore options.',
  'Costs & paying for care',
  11
),

-- Medicare & Medicaid in NJ
(
  'Does Medicare cover assisted living in NJ?',
  'No. Medicare does not cover assisted living in New Jersey or any other state. Medicare is health insurance — it covers hospital stays, doctor visits, and short-term skilled nursing care after hospitalization (up to 100 days). It does not pay for long-term custodial care like assisted living. Medicaid, which is a separate program, may help cover assisted living costs in NJ through the MLTSS (Managed Long Term Services and Supports) program for those who financially qualify.',
  'Medicare & Medicaid in NJ',
  3
),
(
  'What does Medicaid cover for senior care in NJ?',
  'In New Jersey, Medicaid covers senior care through the MLTSS (Managed Long Term Services and Supports) program. This can include nursing home care, assisted living (at participating facilities), home and community-based services, adult day care, and personal care assistance. To qualify, individuals generally must have limited income and assets. NJ has specific financial eligibility requirements that are updated periodically. You can apply through your county Board of Social Services or call NJ''s ADRC at 1-877-222-3737.',
  'Medicare & Medicaid in NJ',
  4
),
(
  'How do I find NJ Medicaid-approved facilities?',
  'On ComfySeniors.com, you can filter search results to show only facilities that accept Medicaid. You can also contact NJ''s ADRC (Aging and Disability Resource Connection) at 1-877-222-3737 or visit your county Board of Social Services. Each Medicaid managed care organization (MCO) in NJ also maintains a provider directory of participating facilities. Not all assisted living facilities accept Medicaid, so it''s important to confirm directly with any facility you''re considering.',
  'Medicare & Medicaid in NJ',
  13
),

-- What to look for in a facility
(
  'What questions should I ask on a facility tour?',
  'Key questions to ask during a tour: What is the all-in monthly cost and what additional fees may apply? What is the staff-to-resident ratio during day and night shifts? How do you handle medical emergencies? Can I see a copy of your most recent state inspection report? What activities and programs do you offer? How do you handle medication management? What happens if my loved one''s care needs increase? Can I speak with current residents or family members? Ask to see the dining room during a meal and visit at different times of day.',
  'What to look for in a facility',
  7
),
(
  'What should I look for in online reviews?',
  'Look for patterns rather than individual reviews — consistent mentions of staff quality, cleanliness, food, activities, and responsiveness to concerns are more telling than one-off complaints. Pay attention to how recently reviews were posted and whether management responds to feedback. Be cautious of facilities with only perfect 5-star reviews, as this may indicate filtered or solicited reviews. On ComfySeniors, all reviews are published unfiltered so you get the full picture.',
  'What to look for in a facility',
  14
),
(
  'Can my parent be on multiple waiting lists?',
  'Yes, and it''s recommended. Many desirable senior care facilities in New Jersey have waiting lists, especially for Medicaid beds or popular communities. There is no rule preventing you from being on multiple waiting lists simultaneously. Getting on lists early — even before care is immediately needed — gives you more options when the time comes. Ask each facility about their waitlist process, estimated wait time, and whether a deposit is required.',
  'What to look for in a facility',
  9
),

-- How to read inspection records
(
  'What are NJ state inspection citations?',
  'State inspection citations are violations found when the New Jersey Department of Health inspects a senior care facility. Inspections check for compliance with state health and safety regulations covering areas like resident care, medication handling, staffing levels, building safety, and sanitation. Citations range from minor paperwork issues to serious care deficiencies. Every licensed facility in NJ is inspected, and results are public record. On ComfySeniors, we show citation counts and summaries on every facility page.',
  'How to read inspection records',
  5
),
(
  'How do I know if a facility is licensed in NJ?',
  'All senior care facilities in New Jersey must be licensed by the NJ Department of Health. You can verify a facility''s license status through the NJ Health Care Facility Licensing portal or by searching on ComfySeniors.com where we display license information for every listed facility. If a facility cannot provide proof of a current NJ license, that is a serious red flag. Never place a loved one in an unlicensed facility.',
  'How to read inspection records',
  6
),
(
  'How often does NJ inspect senior care facilities?',
  'New Jersey''s Department of Health conducts routine inspections of licensed senior care facilities, typically on an annual basis, though the exact frequency can vary. Nursing homes that participate in Medicare or Medicaid are inspected at least every 15 months by federal requirement. Additional inspections may occur in response to complaints or serious incidents. Inspection results are public record — on ComfySeniors, we show the date of the last inspection and any citations on every facility profile.',
  'How to read inspection records',
  15
);
