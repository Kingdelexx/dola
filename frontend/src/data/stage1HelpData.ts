export interface HelpContent {
  title: string;
  concept: string;
  steps: string[];
}

export const STAGE1_HELP_DATA: Record<string, HelpContent> = {
  // Part 1
  'counting': {
    title: "Counting Objects",
    concept: "We count items one by one to find the total number of objects in a group.",
    steps: [
      "Point to each item on the screen and count: 1, 2, 3...",
      "Try to touch each item only once so you don't double-count.",
      "Match your final count with one of the number buttons below!"
    ]
  },
  'recognition': {
    title: "Number Recognition",
    concept: "Recognizing a number means matching the written number symbol to a quantity of objects.",
    steps: [
      "Look closely at the number asked in the question.",
      "Count the items in each option group.",
      "Click the group that has the exact same number of items!"
    ]
  },
  'comparison': {
    title: "Comparing Numbers",
    concept: "Comparison helps us understand which group has more (greater than) or fewer (less than) items.",
    steps: [
      "Count the objects in both groups to get their numbers.",
      "Compare the two numbers: which one is larger, and which one is smaller?",
      "If the question asks for 'more', pick the bigger number. If it asks for 'fewer', pick the smaller one!"
    ]
  },
  'sequencing': {
    title: "Number Sequencing",
    concept: "Sequencing means arranging numbers in a specific order, like counting up (ascending) or counting down (descending).",
    steps: [
      "Read the numbers shown in the list from left to right.",
      "Identify if they are getting bigger (+1 each time) or smaller (-1 each time).",
      "Fill in the missing number that fits the counting sequence!"
    ]
  },
  'odd-even': {
    title: "Odd vs. Even Numbers",
    concept: "Even numbers can be split into pairs of two with none left over. Odd numbers always have one left over.",
    steps: [
      "Even numbers always end in: 0, 2, 4, 6, or 8.",
      "Odd numbers always end in: 1, 3, 5, 7, or 9.",
      "Try pairing up the items. If everyone has a partner, it's Even. If one is left alone, it's Odd!"
    ]
  },
  'place-value': {
    title: "Tens and Ones",
    concept: "Numbers are built from columns: the 'Tens' column and the 'Ones' column. One 'Ten' is a block of 10 items.",
    steps: [
      "Count how many groups of ten items there are (each group counts as 10).",
      "Count the individual single items left over (these count as 1).",
      "Combine them: 3 tens and 4 ones make 34!"
    ]
  },
  'addition': {
    title: "Simple Addition",
    concept: "Addition is combining two or more groups together to find the sum.",
    steps: [
      "Count the objects in the first group.",
      "Count the objects in the second group.",
      "Add them together by counting all the objects in both groups combined."
    ]
  },
  'subtraction': {
    title: "Simple Subtraction",
    concept: "Subtraction is taking away some items from a group to find how many are left.",
    steps: [
      "Start with the total number of items shown.",
      "Cross out or remove the number of items being subtracted.",
      "Count the remaining items that are left over."
    ]
  },
  'bonds': {
    title: "Number Bonds",
    concept: "Number bonds are pairs of numbers that add up to a target number (like bonds to 10 or bonds to 20).",
    steps: [
      "Look at the target number (for example, 10).",
      "Look at the starting number you are given (for example, 7).",
      "Count up from the starting number until you reach the target: 8, 9, 10. That's 3 steps!"
    ]
  },
  'skip-counting': {
    title: "Skip Counting",
    concept: "Skip counting means counting by skipping some numbers, like counting by 2s, 5s, or 10s.",
    steps: [
      "Find the pattern: subtract two numbers next to each other to see what we are counting by (e.g. 5, 10, 15 means we add 5).",
      "Add that amount to the last number in the sequence.",
      "Select the answer that matches your result!"
    ]
  },

  // Part 2
  'addition-regrouping': {
    title: "Addition with Regrouping",
    concept: "When adding columns, if the sum in the Ones column is 10 or more, we 'regroup' 10 ones into 1 ten and carry it to the Tens column.",
    steps: [
      "Add the numbers in the Ones (right) column first.",
      "If the sum is 10 or more, write down the Ones digit of the sum, and carry the 1 to the top of the Tens (left) column.",
      "Add all the numbers in the Tens column, including the carried 1, to get your final answer!"
    ]
  },
  'subtraction-borrowing': {
    title: "Subtraction with Borrowing",
    concept: "If the top digit in the Ones column is smaller than the bottom digit, we must 'borrow' 1 ten from the Tens column.",
    steps: [
      "Look at the Ones column. If the top number is too small, take 1 ten from the Tens column (subtract 1 from the tens digit).",
      "Add 10 to the top Ones digit.",
      "Subtract the Ones column first, then subtract the remaining Tens column!"
    ]
  },
  'multiplication-basics': {
    title: "Multiplication Basics",
    concept: "Multiplication is repeated addition. For example, 3 groups of 4 is the same as 4 + 4 + 4.",
    steps: [
      "Look at the equation: A × B means 'A groups of B items'.",
      "Count the total number of items across all groups.",
      "For example: 2 × 5 means 2 groups of 5 stars. 5 + 5 = 10!"
    ]
  },
  'division-basics': {
    title: "Division Basics",
    concept: "Division is sharing a large group of items into equal smaller groups.",
    steps: [
      "Start with the total number of items.",
      "Share them equally among the number of groups requested.",
      "Count how many items are in just ONE of the groups. That is your answer!"
    ]
  },
  'times-tables': {
    title: "Times Tables Practice",
    concept: "Times tables are multiplication facts that we practice to solve math problems quickly.",
    steps: [
      "Recall your skip-counting rules for the multiplier.",
      "For example, for 3 × 6, count by 3s six times: 3, 6, 9, 12, 15, 18.",
      "Pick the answer that matches your times table fact."
    ]
  },
  'factors-multiples': {
    title: "Factors and Multiples",
    concept: "Factors are numbers you multiply together to get another number. Multiples are the products in a times table.",
    steps: [
      "To find a factor of a number, ask: can this number be divided evenly with no remainder?",
      "To find a multiple of a number, multiply it by 1, 2, 3, etc. (e.g. multiples of 4 are 4, 8, 12, 16).",
      "Match the criteria in the question to find the matching number!"
    ]
  },
  'word-problems': {
    title: "Math Word Problems",
    concept: "Word problems are real-life stories where we use math operations (+, -, ×, ÷) to find answers.",
    steps: [
      "Read the story carefully and identify the numbers given.",
      "Look for keyword clues: 'in all' or 'total' usually means add (+), 'left' or 'difference' means subtract (-), 'each' or 'groups' means multiply/divide.",
      "Write down the equation and solve it step-by-step."
    ]
  },
  'estimation-rounding': {
    title: "Estimation and Rounding",
    concept: "Rounding makes numbers simpler and easier to work with in our head by moving to the nearest 10 or 100.",
    steps: [
      "Look at the digit in the Ones column.",
      "If the Ones digit is 5 or more (5, 6, 7, 8, 9), 'round up' by adding 1 to the Tens digit and changing Ones to 0.",
      "If the Ones digit is less than 5 (0, 1, 2, 3, 4), 'round down' by keeping the Tens digit the same and changing Ones to 0."
    ]
  },
  'money-calculations': {
    title: "Money Calculations",
    concept: "Coins and bills have different values. We add them together to buy items and calculate change.",
    steps: [
      "Add up the values of all the coins and bills shown to see how much money you have.",
      "If you are buying something, subtract the price of the item from your total money.",
      "The result is the change you should receive!"
    ]
  },
  'speed-maths': {
    title: "Speed Maths Challenger",
    concept: "Speed maths helps us think fast by answering simple math equations within a short timer limit.",
    steps: [
      "Look at the equation quickly (addition or subtraction).",
      "Do the math in your head as fast as you can.",
      "Click the correct option before the timer bar runs out!"
    ]
  },

  // Part 3
  'number-patterns': {
    title: "Number Patterns",
    concept: "Number patterns are lists of numbers that follow a specific rule (like adding or subtracting a number each time).",
    steps: [
      "Compare the first two numbers to see if they increase (+) or decrease (-).",
      "Check the difference: e.g. 2, 4, 6, 8 increases by 2 each time (+2).",
      "Apply the same rule to find the missing pattern numbers!"
    ]
  },
  'shape-patterns': {
    title: "Shape Patterns",
    concept: "Shape patterns are repeating sequences of shapes that follow a set order (like Circle, Square, Triangle, Circle...).",
    steps: [
      "Look at the shapes from left to right and identify the repeating group.",
      "Once you find the repeat (e.g. Red, Blue, Red, Blue), look at the last shape shown.",
      "Pick the shape that must come next to continue the repeating pattern!"
    ]
  },
  'growing-patterns': {
    title: "Growing Patterns",
    concept: "Growing patterns change by a larger amount in each step (e.g. adding +1, then +2, then +3).",
    steps: [
      "Find the change between the first step and the second step.",
      "Find the change between the second step and the third step. Notice how the change itself is growing!",
      "Continue the growth step to find the next shape or number configuration."
    ]
  },
  'missing-patterns': {
    title: "Missing Elements in Patterns",
    concept: "Patterns sometimes have gaps in the middle. We use the surrounding numbers to figure out the rule.",
    steps: [
      "Look at the numbers before and after the empty slot.",
      "Identify the regular gap spacing size.",
      "Fill in the missing element that matches both sides of the gap!"
    ]
  },
  'simple-sequences': {
    title: "Simple Sequences",
    concept: "Sequences are lists of numbers arranged according to a mathematical rule.",
    steps: [
      "Identify the start number.",
      "Discover the transition step: is it addition, subtraction, or doubling?",
      "Compute the next term using the transition step."
    ]
  },
  'rule-based-patterns': {
    title: "Rule-Based Systems",
    concept: "A rule-based pattern uses a written instruction (like 'Double the number and add 1') to create a sequence.",
    steps: [
      "Read the rule carefully.",
      "Apply the rule to the input number given.",
      "For example, if the input is 5 and the rule is 'Multiply by 2 and add 3': 5 × 2 = 10, then 10 + 3 = 13!"
    ]
  },
  'matching-sorting': {
    title: "Matching and Sorting",
    concept: "Sorting groups items together that share common characteristics, like color, shape type, or size.",
    steps: [
      "Look at the categories listed.",
      "Examine the attributes of the item on screen.",
      "Sort it into the group that matches its category!"
    ]
  },
  'classification': {
    title: "Data Classification",
    concept: "Classification is organizing data elements into categories (like Odd vs. Even or Prime vs. Composite).",
    steps: [
      "Check the property of the item (e.g. is it a number, a 3D shape, or an operational symbol?).",
      "Compare it with the classification rules.",
      "Assign it to the correct class tag!"
    ]
  },
  'boolean-statements': {
    title: "Boolean: True or False",
    concept: "Boolean logic represents statements that can only be either TRUE or FALSE.",
    steps: [
      "Read the mathematical statement (e.g. '5 + 3 = 8' or '12 is an odd number').",
      "Decide if the statement is correct (True) or incorrect (False).",
      "Click the True or False button!"
    ]
  },
  'conditional-reasoning': {
    title: "If-This-Then-That Logic",
    concept: "Conditional statements perform actions only IF a specific condition is met.",
    steps: [
      "Check the 'IF' condition: is it met? (e.g. 'If the color is blue...').",
      "If the condition is met, perform action 'THEN'.",
      "If the condition is NOT met, perform action 'ELSE'!"
    ]
  },

  // Part 4
  'basic-shapes': {
    title: "Basic 2D Shapes",
    concept: "2D shapes are flat shapes with width and height. Examples include circles, triangles, squares, and rectangles.",
    steps: [
      "Count the number of straight sides and corners (vertices) on the shape.",
      "3 sides is a Triangle, 4 equal sides is a Square, 4 sides with longer pairs is a Rectangle.",
      "Match the shape image with its correct name!"
    ]
  },
  '2d-3d-shapes': {
    title: "2D vs. 3D Shapes",
    concept: "2D shapes are flat (like a square). 3D shapes have depth and volume (like a cube, sphere, or cylinder).",
    steps: [
      "Look at the shape. Does it look flat, or does it have three dimensions (faces, edges, corners)?",
      "A circle is 2D, but a ball (sphere) is 3D.",
      "Select the category that correctly fits the shape shown."
    ]
  },
  'symmetry': {
    title: "Line of Symmetry",
    concept: "Symmetry means that one half of a shape is a mirror reflection of the other half.",
    steps: [
      "Imagine folding the shape in half along the dotted line.",
      "Do the two halves line up perfectly and look identical?",
      "If yes, the shape has symmetry. Select the symmetrical mirror option!"
    ]
  },
  'position-direction': {
    title: "Position and Direction",
    concept: "Directional terms tell us where to go (like Forward, Backward, Turn Left, Turn Right).",
    steps: [
      "Look at the heading arrow to see which direction the actor is facing.",
      "Determine what turn or movement is needed to point toward the goal.",
      "Choose the matching direction command!"
    ]
  },
  'relative-movement': {
    title: "Left, Right, Up, Down",
    concept: "Relative movements shift an object on a screen along horizontal (left/right) or vertical (up/down) paths.",
    steps: [
      "Look at the grid.",
      "To move up or down, shift along the vertical columns.",
      "To move left or right, shift along the horizontal rows."
    ]
  },
  'turns-clockwise': {
    title: "Clockwise & Anticlockwise Turns",
    concept: "Clockwise turns rotate in the direction of clock hands (to the right). Anticlockwise rotates to the left.",
    steps: [
      "Visualize the clock face. A clockwise turn rotates from 12 toward 3.",
      "An anticlockwise (counter-clockwise) turn rotates from 12 toward 9.",
      "Determine the degrees or direction of rotation required to match the target alignment."
    ]
  },
  'angles-basics': {
    title: "Introduction to Angles",
    concept: "Angles measure the amount of turn between two lines. A right angle is exactly 90 degrees (looks like an L).",
    steps: [
      "An angle smaller than a right angle (<90°) is Acute.",
      "An angle that is exactly a square corner (90°) is a Right Angle.",
      "An angle larger than a right angle (>90°) is Obtuse."
    ]
  },
  'grid-movement': {
    title: "Grid Path Navigation",
    concept: "Grid navigation involves steering a character through cell coordinates on a grid array map.",
    steps: [
      "Look at the grid size and boundary walls.",
      "Plan the path step-by-step from start to finish.",
      "Apply the command blocks (Move, Turn) to trace the path without hitting obstacles!"
    ]
  },
  'cartesian-coordinates': {
    title: "Cartesian Coordinates (X, Y)",
    concept: "Coordinates tell us the exact position on a grid. The first number (X) is horizontal, and the second (Y) is vertical.",
    steps: [
      "Start at the origin point (0,0) at the bottom left.",
      "Count along the horizontal X-axis (right) first.",
      "Then count up along the vertical Y-axis (up) to find the coordinate (X, Y)."
    ]
  },
  'maps-routes': {
    title: "Maps and Shortest Routes",
    concept: "Pathfinding algorithms search grids to find the shortest route between two locations.",
    steps: [
      "Check all available paths between the start node and end node.",
      "Count the steps or sum the weights along each route.",
      "Select the path with the smallest total steps/distance!"
    ]
  },

  // Part 5
  'measure-length': {
    title: "Length Measurement",
    concept: "We measure length to find how long or wide an object is, usually using a ruler in centimeters (cm).",
    steps: [
      "Align the left edge of the object with the 0 mark on the ruler.",
      "Look at the right edge of the object.",
      "Read the number directly below the right edge on the ruler scale to get the length in cm!"
    ]
  },
  'measure-height': {
    title: "Height Comparison",
    concept: "Height measures how tall an object is from the ground up.",
    steps: [
      "Read the target height asked in the question.",
      "Count the vertical height grid blocks or look at the number labels on top of the towers.",
      "Select the tower that matches the height value requested!"
    ]
  },
  'measure-weight': {
    title: "Weight and Balances",
    concept: "Weight measures how heavy an object is. A balance scale compares weights: heavier objects tilt down.",
    steps: [
      "Look at the weight blocks placed on the balance scales.",
      "If the scale is level, the weight on the left equals the weight on the right.",
      "Pick the weight option that successfully balances the scale as requested."
    ]
  },
  'measure-time': {
    title: "Reading Analog Clocks",
    concept: "Clocks measure time. The short hand points to the hour. The long hand points to the minutes.",
    steps: [
      "Look at the short hand first to find the hour (if it is between two numbers, pick the smaller one).",
      "Look at the long minute hand: count by 5s around the dial (12 is :00, 1 is :05, 2 is :10... 6 is :30).",
      "Combine the hour and minutes (e.g. 10:30) and select the correct time!"
    ]
  },
  'measure-calendar': {
    title: "Reading Calendars",
    concept: "Calendars track days, weeks, and months of the year in regular grid patterns.",
    steps: [
      "Find the month and year requested.",
      "Locate the starting date on the grid calendar.",
      "Count forward or backward day-by-day (each row down adds exactly 7 days)."
    ]
  },
  'speed-basics': {
    title: "Speed calculations",
    concept: "Speed is how fast an object moves. It is calculated by dividing distance by time (Speed = Distance ÷ Time).",
    steps: [
      "Find the distance traveled (e.g. 20 meters).",
      "Find the time taken (e.g. 4 seconds).",
      "Divide the distance by the time: 20 ÷ 4 = 5. The speed is 5 meters per second (m/s)!"
    ]
  },
  'measure-distance': {
    title: "Number Line Distance",
    concept: "Distance is the size of the space between two points. We can count steps on a number line.",
    steps: [
      "Locate Point A on the number line.",
      "Locate Point B on the number line.",
      "Subtract the smaller number from the larger number (B - A) to find the distance between them."
    ]
  },
  'measure-temperature': {
    title: "Reading Thermometers",
    concept: "Temperature measures how hot or cold something is, using degrees Celsius (°C).",
    steps: [
      "Look at the colored red liquid inside the thermometer column.",
      "Locate the top of the red line.",
      "Read the number next to the line on the grid scale to get the temperature in °C!"
    ]
  },
  'measure-area': {
    title: "Grid Area Basics",
    concept: "Area is the total amount of flat space inside a shape. We measure it in square units.",
    steps: [
      "Look at the highlighted shape on the grid.",
      "Count every individual square grid box that is filled inside the shape.",
      "The total count of boxes is the area!"
    ]
  },
  'measure-perimeter': {
    title: "Perimeter Basics",
    concept: "Perimeter is the total length of the outer boundary edge around a shape.",
    steps: [
      "Imagine walking all the way around the outer edge of the shape.",
      "Count the grid units along each side of the shape's border.",
      "Add the lengths of all the sides together to find the perimeter!"
    ]
  },

  // Part 6
  'fraction-whole': {
    title: "Fractions as Parts of a Whole",
    concept: "A fraction represents equal parts of a whole shape or set. The top number (numerator) counts how many parts are selected, and the bottom number (denominator) is the total parts.",
    steps: [
      "Count how many total squares make up the memory bar.",
      "Count how many of those squares are colored or active.",
      "Write them as: active / total (for example, 3 active out of 8 is 3/8)."
    ]
  },
  'fraction-equivalence': {
    title: "Equivalent Fractions",
    concept: "Equivalent fractions represent the exact same value or portion, even though they use different numbers. You can find them by multiplying or dividing the top and bottom by the same number.",
    steps: [
      "Look at the starting base fraction (e.g. 2/3).",
      "Multiply both the numerator and denominator by 2, 3, or 4 to see which option matches.",
      "For example: 2/3 * (3/3) = 6/9, which represents the same visual ratio."
    ]
  },
  'fraction-comparison': {
    title: "Comparing Fractions",
    concept: "To compare fractions, look at which one takes up more space. If the denominators are different, you can compare them by finding a common denominator or using cross-multiplication.",
    steps: [
      "Look at the two fractions (e.g. 3/4 and 5/8).",
      "Convert them to have the same bottom number (3/4 becomes 6/8).",
      "Compare the top numbers: 6/8 is bigger than 5/8, so 3/4 > 5/8!"
    ]
  },
  'fraction-addition': {
    title: "Adding Fractions",
    concept: "When adding fractions with the same denominator, simply add the numerators (top numbers) together. Keep the denominator (bottom number) exactly the same.",
    steps: [
      "Check that both bottom numbers are equal (e.g. 1/5 and 3/5).",
      "Add the top numbers: 1 + 3 = 4.",
      "Combine them to get the final fraction: 4/5."
    ]
  },
  'decimal-basics': {
    title: "Decimal Conversions",
    concept: "Decimals are another way to write fractions. For example, 1/2 is the same as 0.5, and 1/4 is 0.25.",
    steps: [
      "Identify the fraction being converted (e.g. 3/4).",
      "Think of division: 3 divided by 4 is 0.75.",
      "Select the decimal option that corresponds to this value."
    ]
  },
  'decimal-money': {
    title: "Monetary Decimals",
    concept: "Money values use two decimal places for cents. Adding them follows standard column addition, aligning the decimal point.",
    steps: [
      "Write out the decimal prices in a column, aligning the points.",
      "Add the cents column first, then carry over to the dollars.",
      "For example: $2.50 + $1.25 + $3.10 = $6.85."
    ]
  },
  'percentage-basics': {
    title: "Percentage Conversions",
    concept: "Percent means 'out of 100'. A percentage represents a fraction where the denominator is scaled to 100.",
    steps: [
      "Take your starting fraction (e.g. 4/5).",
      "Multiply the top and bottom to make the bottom 100: 4/5 * (20/20) = 80/100.",
      "That means 80%! Select the correct option."
    ]
  },
  'percentage-discount': {
    title: "Dynamic Discounts",
    concept: "A discount is a percentage subtracted from the original price. Calculate the discount value first, then subtract it.",
    steps: [
      "Find the discount amount: multiply the price by the discount percent (e.g. 25% of $80 is $20).",
      "Subtract that discount from the original price: $80 - $20 = $60.",
      "Pick the matching discounted total!"
    ]
  },
  'ratio-basics': {
    title: "Understanding Ratios",
    concept: "A ratio compares two quantities, showing how much of one thing exists compared to another (e.g. 2 green to 3 purple is written 2:3).",
    steps: [
      "Count the first item group (e.g. green squares = 4).",
      "Count the second item group (e.g. purple squares = 6).",
      "Simplify the ratio by dividing both numbers by their common factor: 4:6 simplifies to 2:3."
    ]
  },
  'proportion-basics': {
    title: "Resource Proportions",
    concept: "Proportion means that two ratios are equal. If resources scale up, they must multiply by the same factor.",
    steps: [
      "Find the ratio multiplier: compare the new nodes to the base nodes (e.g. 6 nodes is 3 times more than 2 nodes).",
      "Multiply the task count by the same multiplier: 10 tasks * 3 = 30 tasks.",
      "Verify the scaled result matches your selection."
    ]
  },

  // Part 7
  'data-collecting': {
    title: "Collecting Data",
    concept: "Data collection is counting and organizing items into groups so we can analyze them easily.",
    steps: [
      "Go through the list of items one by one.",
      "Tally or count each occurrence of item A, item B, and item C.",
      "Enter the counts in the tally boxes to form your dataset."
    ]
  },
  'data-tables': {
    title: "Reading Data Tables",
    concept: "Tables organize information into vertical columns and horizontal rows. You read them by finding the intersection of a row and a column.",
    steps: [
      "Locate the correct row asked in the question (e.g. US-East server).",
      "Locate the correct column (e.g. Ping ms).",
      "Find the value where that row and column meet on the grid."
    ]
  },
  'data-pictograms': {
    title: "Decoding Pictograms",
    concept: "A pictogram uses pictures or symbols to show data. Check the key to see how many units each symbol represents.",
    steps: [
      "Look at the key description: 'each symbol represents 5 units'.",
      "Count the symbols shown for the requested category (e.g. 3 stars).",
      "Multiply the symbol count by the key value: 3 * 5 = 15."
    ]
  },
  'data-bar-charts': {
    title: "Interpreting Bar Charts",
    concept: "Bar charts display quantities as rectangular bars. The height of the bar shows its numerical value.",
    steps: [
      "Look at the categories along the bottom axis.",
      "Compare the heights of the bars to see which is tallest or shortest.",
      "Read the level corresponding to the top of the bar on the side scale."
    ]
  },
  'data-line-graphs': {
    title: "Reading Line Graphs",
    concept: "Line graphs plot points and connect them with lines to show trends over time. Read them by tracing up from the horizontal axis and across to the vertical axis.",
    steps: [
      "Find the step number along the bottom X-axis.",
      "Follow the grid line up to the plotted point.",
      "Follow the line to the left Y-axis to read the numerical value."
    ]
  },
  'data-pie-charts': {
    title: "Pie Chart Sectors",
    concept: "A pie chart represents parts of a whole circle. A half circle is 50%, a quarter is 25%, and the biggest slice holds the largest share.",
    steps: [
      "Look at the circular slices of the pie chart.",
      "Compare sector sizes visually or look at their percentage labels.",
      "Select the sector label that matches the query."
    ]
  },
  'data-mean': {
    title: "Calculating the Mean",
    concept: "The mean is the average. To find it, add all the numbers together, then divide by the total count of numbers.",
    steps: [
      "Add the values: e.g. 4 + 8 + 12 = 24.",
      "Count how many values there are: 3 values.",
      "Divide the sum by the count: 24 / 3 = 8."
    ]
  },
  'data-median': {
    title: "Locating the Median",
    concept: "The median is the middle number in a sorted list. Sort the list from smallest to largest and find the value right in the center.",
    steps: [
      "Make sure the numbers are sorted from smallest to largest.",
      "Cross off one number from each end until you are left with the single middle number.",
      "That middle number is your median (e.g. in [3, 5, 7, 8, 10], it is 7)."
    ]
  },
  'data-mode': {
    title: "Finding the Mode",
    concept: "The mode is the number that appears most frequently in a dataset. A dataset can have one mode, more than one, or none.",
    steps: [
      "Count how many times each number appears in the list.",
      "Identify which number has the highest count.",
      "For example, in [2, 4, 4, 6, 8], 4 appears twice, making it the mode!"
    ]
  },
  'data-interpretation': {
    title: "Data Interpretation",
    concept: "Data interpretation is answering questions about a dataset, like finding the range (difference between maximum and minimum).",
    steps: [
      "Find the maximum value in the dataset (e.g. 90).",
      "Find the minimum value in the dataset (e.g. 10).",
      "Subtract the minimum from the maximum to find the difference: 90 - 10 = 80."
    ]
  },

  // Part 8
  'algo-steps': {
    title: "Sequential Execution",
    concept: "Algorithms are step-by-step procedures. Order is crucial, as each step builds on the previous one.",
    steps: [
      "Read all the actions needed to achieve the goal.",
      "Decide what must happen first (e.g. power up before booting).",
      "Arrange the steps chronologically to form the correct sequence."
    ]
  },
  'algo-decomposition': {
    title: "Problem Decomposition",
    concept: "Decomposition is breaking a complex task down into smaller, manageable sub-tasks.",
    steps: [
      "Identify the main goal (e.g. drawing a house).",
      "Filter the sub-task options to find only those directly needed for the goal.",
      "Ignore unrelated sub-tasks (like baking a cake) and check the core ones."
    ]
  },
  'algo-bugs': {
    title: "Debugging and Bug Finding",
    concept: "A bug is an error in an algorithm that causes it to behave unexpectedly. Debugging is locating and fixing this error.",
    steps: [
      "Trace the steps in the sequence one by one.",
      "Identify which step is out of place, unsafe, or leads to a crash.",
      "Select that faulty step to patch the logic!"
    ]
  },
  'algo-math-bugs': {
    title: "Debugging Math Statements",
    concept: "Math bugs occur when a step in a calculation contains a logical error or arithmetic mistake.",
    steps: [
      "Inspect each line of the calculation carefully.",
      "Re-do the math for each step: check if x + 5 equals the stated value, and so on.",
      "Find the step where the arithmetic fails (e.g. y * 2 = 45 when y is 15 is incorrect)."
    ]
  },
  'algo-logic-puzzles': {
    title: "Logical Deductions",
    concept: "Deductive logic uses given statements to draw a logical conclusion. If A > B and B > C, then A > C.",
    steps: [
      "Read the facts step-by-step.",
      "Map out the relationships (e.g. A is faster than B, B is faster than C).",
      "Follow the chain of links to find the final answer (A is the fastest)."
    ]
  },
  'algo-word-problems': {
    title: "Requirements Translation",
    concept: "Translating word problems into math models involves identifying the starting state, addition events, and subtraction events.",
    steps: [
      "Identify the starting quantity (e.g. 10 files).",
      "Add any incoming items (+5 files = 15).",
      "Subtract any removed items (-3 files = 12)."
    ]
  },
  'algo-brain-teasers': {
    title: "Pattern Cryptography",
    concept: "Cryptography looks for mathematical rules hidden in number sequences, like doubling the number each time.",
    steps: [
      "Look at the transition between the numbers: 2 to 4, 4 to 8, 8 to 16.",
      "Identify the rule: each number is multiplied by 2.",
      "Apply the rule to the last number: 16 * 2 = 32."
    ]
  },
  'algo-strategy': {
    title: "Optimal Strategies",
    concept: "Heuristics and game theory algorithms find the optimal path or choice to win a game or complete a task.",
    steps: [
      "Evaluate the outcome of each possible choice.",
      "Choose the action that guarantees a win or forces the opponent into a bad position.",
      "Select that optimal strategy choice."
    ]
  },
  'algo-flowchart': {
    title: "Flowchart Branching",
    concept: "Flowcharts show execution paths using decision blocks. The program takes different branches depending on the input values.",
    steps: [
      "Check the input value (e.g. temperature is 85).",
      "Evaluate the decision block: is 85 > 80? Yes.",
      "Follow the 'Yes' path to read the action (set fan to 1)."
    ]
  },
  'algo-design': {
    title: "Designing Loops",
    concept: "Loops repeat a block of code multiple times. Instead of writing 'Move Forward' three times, we write a loop that repeats it 3 times.",
    steps: [
      "Identify what action needs to be repeated (e.g. Move Forward).",
      "Count how many times it needs to repeat to reach the destination.",
      "Select the loop structure that matches this count (Repeat 3 times)."
    ]
  }
};
