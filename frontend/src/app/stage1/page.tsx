'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FeedbackModal from '@/components/FeedbackModal';
import LizzyChat from '@/components/LizzyChat';
import { useAuth } from '@/context/AuthContext';
import { STAGE1_NUMERACY_PARTS, NumeracyLevel, NumeracyPart } from '@/data/stage1NumeracyLevels';
import { STAGE1_HELP_DATA } from '@/data/stage1HelpData';
import { 
  Rocket, Star, Sparkles, Trophy, Brain, Lightbulb, Play, CheckCircle, 
  ArrowRight, AlertTriangle, RefreshCw, Cpu, ShieldAlert, Binary, HelpCircle, Lock, Gamepad2, Info
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const PART_COLORS = [
  'from-pink-450 to-rose-500 shadow-rose-200',
  'from-sky-400 to-blue-500 shadow-blue-200',
  'from-indigo-400 to-purple-500 shadow-indigo-200',
  'from-teal-400 to-emerald-500 shadow-emerald-200',
  'from-amber-450 to-orange-500 shadow-orange-200',
  'from-fuchsia-400 to-violet-500 shadow-fuchsia-200',
  'from-cyan-400 to-teal-500 shadow-cyan-200',
  'from-red-400 to-rose-500 shadow-rose-200',
];

export default function Stage1Page() {
  const router = useRouter();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentPartIndex, setCurrentPartIndex] = useState(0); // 0 = Part 1, 1 = Part 2, 2 = Part 3, 3 = Part 4
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0); // 0 to 9
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(0); // 0 to 40 global level index
  const [showModal, setShowModal] = useState(false);
  const { user, updateUser, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.profile?.role === 'parent') {
        router.push('/parent-dashboard');
      }
    }
  }, [user, loading, router]);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<any[]>([]);
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [animationData, setAnimationData] = useState<any>(null);
  
  // Game states
  const [success, setSuccess] = useState<boolean | null>(null);
  const [shake, setShake] = useState(false);
  
  // Level-specific states (Part 1)
  const [countingStep, setCountingStep] = useState(0); // 0 or 1
  const [selectedCountingAnswer, setSelectedCountingAnswer] = useState<number | null>(null);
  const [selectedRecognitionAnswer, setSelectedRecognitionAnswer] = useState<number | null>(null);
  const [comparisonStep, setComparisonStep] = useState(0); // 0, 1, 2
  const [selectedComparisonAnswer, setSelectedComparisonAnswer] = useState<string | null>(null);
  const [sequencingSorted, setSequencingSorted] = useState<number[]>([]);
  const [oddEvenIndex, setOddEvenIndex] = useState(0);
  const [oddEvenScore, setOddEvenScore] = useState(0);
  const [oddEvenHistory, setOddEvenHistory] = useState<{ num: number; correct: boolean }[]>([]);
  const [placeHundreds, setPlaceHundreds] = useState(0);
  const [placeTens, setPlaceTens] = useState(0);
  const [placeUnits, setPlaceUnits] = useState(0);
  const [selectedAdditionAnswer, setSelectedAdditionAnswer] = useState<number | null>(null);
  const [selectedSubtractionAnswer, setSelectedSubtractionAnswer] = useState<number | null>(null);
  const [selectedBondsAnswer, setSelectedBondsAnswer] = useState<number | null>(null);
  const [skipStep, setSkipStep] = useState(0); // 0, 1, 2
  const [selectedSkipAnswer, setSelectedSkipAnswer] = useState<number | null>(null);

  // Level-specific states (Part 2)
  const [additionCarry, setAdditionCarry] = useState<boolean | null>(null);
  const [additionUnits, setAdditionUnits] = useState<number | null>(null);
  const [additionTens, setAdditionTens] = useState<number | null>(null);
  
  const [subtractionBorrowed, setSubtractionBorrowed] = useState(false);
  const [subtractionUnits, setSubtractionUnits] = useState<number | null>(null);
  const [subtractionTens, setSubtractionTens] = useState<number | null>(null);
  
  const [selectedMultiplicationAnswer, setSelectedMultiplicationAnswer] = useState<number | null>(null);
  const [selectedDivisionAnswer, setSelectedDivisionAnswer] = useState<number | null>(null);
  
  const [timesTableStep, setTimesTableStep] = useState(0); // 0, 1, 2
  const [selectedTimesTableAnswer, setSelectedTimesTableAnswer] = useState<number | null>(null);
  
  const [selectedFactors, setSelectedFactors] = useState<number[]>([]);
  const [selectedWordAnswer, setSelectedWordAnswer] = useState<number | null>(null);
  const [selectedRoundingAnswer, setSelectedRoundingAnswer] = useState<number | null>(null);
  const [selectedMoneyAnswer, setSelectedMoneyAnswer] = useState<number | null>(null);
  
  // Speed math states
  const [speedMathStep, setSpeedMathStep] = useState(0); // 0, 1, 2
  const [speedMathTimer, setSpeedMathTimer] = useState(6); // 6 seconds per question
  const [speedMathActive, setSpeedMathActive] = useState(false);
  const [speedMathAnswers, setSpeedMathAnswers] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Level-specific states (Part 3)
  const [selectedPatternAnswer, setSelectedPatternAnswer] = useState<number | null>(null);
  const [selectedShapeAnswer, setSelectedShapeAnswer] = useState<string | null>(null);
  const [selectedGrowingAnswer, setSelectedGrowingAnswer] = useState<number | null>(null);
  const [selectedMissingAnswer, setSelectedMissingAnswer] = useState<number | null>(null);
  const [sequenceBlocksSorted, setSequenceBlocksSorted] = useState<string[]>([]);
  const [selectedRuleAnswer, setSelectedRuleAnswer] = useState<number | null>(null);
  const [currentlySelectedKey, setCurrentlySelectedKey] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [classificationStep, setClassificationStep] = useState(0);
  const [selectedBooleanAnswer, setSelectedBooleanAnswer] = useState<boolean | null>(null);
  const [selectedConditionalAnswer, setSelectedConditionalAnswer] = useState<number | null>(null);

  // Level-specific states (Part 4)
  const [shapeStep, setShapeStep] = useState(0);
  const [selectedShapePropertyAnswer, setSelectedShapePropertyAnswer] = useState<string | null>(null);
  const [shape2d3dStep, setShape2d3dStep] = useState(0);
  const [selectedSymmetryAnswer, setSelectedSymmetryAnswer] = useState<boolean[] | null>(null);
  const [selectedPositionDirectionAnswer, setSelectedPositionDirectionAnswer] = useState<string | null>(null);
  const [relativeMoveSequence, setRelativeMoveSequence] = useState<string[]>([]);
  const [relativeMovePosition, setRelativeMovePosition] = useState<{ x: number, y: number }>({ x: 2, y: 2 });
  const [selectedTurnsAnswer, setSelectedTurnsAnswer] = useState<number | null>(null);
  const [selectedAnglesAnswer, setSelectedAnglesAnswer] = useState<string | null>(null);
  const [selectedGridAnswer, setSelectedGridAnswer] = useState<string | null>(null);
  const [selectedCartesianAnswer, setSelectedCartesianAnswer] = useState<string | null>(null);
  const [selectedMapRoute, setSelectedMapRoute] = useState<string[]>([]);

  // Level-specific states (Part 5)
  const [selectedLengthAnswer, setSelectedLengthAnswer] = useState<number | null>(null);
  const [selectedHeightAnswer, setSelectedHeightAnswer] = useState<string | null>(null);
  const [selectedWeightAnswer, setSelectedWeightAnswer] = useState<number | null>(null);
  const [selectedTimeAnswer, setSelectedTimeAnswer] = useState<string | null>(null);
  const [selectedCalendarAnswer, setSelectedCalendarAnswer] = useState<string | null>(null);
  const [selectedSpeedAnswer, setSelectedSpeedAnswer] = useState<number | null>(null);
  const [selectedDistanceAnswer, setSelectedDistanceAnswer] = useState<number | null>(null);
  const [selectedTemperatureAnswer, setSelectedTemperatureAnswer] = useState<number | null>(null);
  const [selectedAreaAnswer, setSelectedAreaAnswer] = useState<number | null>(null);
  const [selectedPerimeterAnswer, setSelectedPerimeterAnswer] = useState<number | null>(null);

  // Level-specific states (Part 6)
  const [selectedFractionWholeAnswer, setSelectedFractionWholeAnswer] = useState<string | null>(null);
  const [selectedFractionEquivalenceAnswer, setSelectedFractionEquivalenceAnswer] = useState<string | null>(null);
  const [selectedFractionComparisonAnswer, setSelectedFractionComparisonAnswer] = useState<string | null>(null);
  const [selectedFractionAdditionAnswer, setSelectedFractionAdditionAnswer] = useState<string | null>(null);
  const [selectedDecimalBasicsAnswer, setSelectedDecimalBasicsAnswer] = useState<number | null>(null);
  const [selectedDecimalMoneyAnswer, setSelectedDecimalMoneyAnswer] = useState<number | null>(null);
  const [selectedPercentageBasicsAnswer, setSelectedPercentageBasicsAnswer] = useState<number | null>(null);
  const [selectedPercentageDiscountAnswer, setSelectedPercentageDiscountAnswer] = useState<number | null>(null);
  const [selectedRatioBasicsAnswer, setSelectedRatioBasicsAnswer] = useState<string | null>(null);
  const [selectedProportionBasicsAnswer, setSelectedProportionBasicsAnswer] = useState<number | null>(null);

  // Level-specific states (Part 7)
  const [selectedDataCollectingAnswer, setSelectedDataCollectingAnswer] = useState<{ A?: number, B?: number, C?: number }>({});
  const [selectedDataTablesAnswer, setSelectedDataTablesAnswer] = useState<string | null>(null);
  const [selectedDataPictogramsAnswer, setSelectedDataPictogramsAnswer] = useState<number | null>(null);
  const [selectedDataBarChartsAnswer, setSelectedDataBarChartsAnswer] = useState<string | null>(null);
  const [selectedDataLineGraphsAnswer, setSelectedDataLineGraphsAnswer] = useState<number | null>(null);
  const [selectedDataPieChartsAnswer, setSelectedDataPieChartsAnswer] = useState<string | null>(null);
  const [selectedDataMeanAnswer, setSelectedDataMeanAnswer] = useState<number | null>(null);
  const [selectedDataMedianAnswer, setSelectedDataMedianAnswer] = useState<number | null>(null);
  const [selectedDataModeAnswer, setSelectedDataModeAnswer] = useState<number | null>(null);
  const [selectedDataInterpretationAnswer, setSelectedDataInterpretationAnswer] = useState<number | null>(null);

  // Level-specific states (Part 8)
  const [selectedAlgoStepsAnswer, setSelectedAlgoStepsAnswer] = useState<string[]>([]);
  const [selectedAlgoDecompositionAnswer, setSelectedAlgoDecompositionAnswer] = useState<string[]>([]);
  const [selectedAlgoBugsAnswer, setSelectedAlgoBugsAnswer] = useState<string | null>(null);
  const [selectedAlgoMathBugsAnswer, setSelectedAlgoMathBugsAnswer] = useState<string | null>(null);
  const [selectedAlgoLogicPuzzlesAnswer, setSelectedAlgoLogicPuzzlesAnswer] = useState<string | null>(null);
  const [selectedAlgoWordProblemsAnswer, setSelectedAlgoWordProblemsAnswer] = useState<number | null>(null);
  const [selectedAlgoBrainTeasersAnswer, setSelectedAlgoBrainTeasersAnswer] = useState<number | null>(null);
  const [selectedAlgoStrategyAnswer, setSelectedAlgoStrategyAnswer] = useState<string | null>(null);
  const [selectedAlgoFlowchartAnswer, setSelectedAlgoFlowchartAnswer] = useState<number | null>(null);
  const [selectedAlgoDesignAnswer, setSelectedAlgoDesignAnswer] = useState<string | null>(null);

  useEffect(() => {
    // Load persisted progress
    const savedLevel = user?.profile?.stage1_progress ?? (localStorage.getItem('stage1_progress') ? parseInt(localStorage.getItem('stage1_progress') || '0', 10) : 0);
    setMaxUnlockedLevel(savedLevel);
    if (savedLevel >= 80) {
      setCurrentPartIndex(7);
      setCurrentLevelIndex(9);
    } else {
      setCurrentPartIndex(Math.min(7, Math.floor(savedLevel / 10)));
      setCurrentLevelIndex(savedLevel % 10);
    }
    // Load success lottie
    fetch('/assets/success.json')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch success lottie");
        return res.json();
      })
      .then(data => setAnimationData(data))
      .catch(e => console.error("Could not load success lottie", e));
  }, [user]);

  const part = STAGE1_NUMERACY_PARTS[currentPartIndex] || STAGE1_NUMERACY_PARTS[0];
  const level = part.levels[currentLevelIndex] || part.levels[0];

  // Reset level states when level changes
  useEffect(() => {
    resetLevelState();
    // Cleanup speed math timer on level change
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setSpeedMathActive(false);
  }, [currentPartIndex, currentLevelIndex]);

  // Speed math timer loop
  useEffect(() => {
    if (speedMathActive && speedMathTimer > 0) {
      timerRef.current = setInterval(() => {
        setSpeedMathTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            triggerError();
            setSpeedMathActive(false);
            setSpeedMathStep(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [speedMathActive, speedMathStep, speedMathTimer]);

  const resetLevelState = () => {
    setSuccess(null);
    setCountingStep(0);
    setSelectedCountingAnswer(null);
    setSelectedRecognitionAnswer(null);
    setComparisonStep(0);
    setSelectedComparisonAnswer(null);
    setSequencingSorted([]);
    setOddEvenIndex(0);
    setOddEvenScore(0);
    setOddEvenHistory([]);
    setPlaceHundreds(0);
    setPlaceTens(0);
    setPlaceUnits(0);
    setSelectedAdditionAnswer(null);
    setSelectedSubtractionAnswer(null);
    setSelectedBondsAnswer(null);
    setSkipStep(0);
    setSelectedSkipAnswer(null);

    // Part 2 states
    setAdditionCarry(null);
    setAdditionUnits(null);
    setAdditionTens(null);
    setSubtractionBorrowed(false);
    setSubtractionUnits(null);
    setSubtractionTens(null);
    setSelectedMultiplicationAnswer(null);
    setSelectedDivisionAnswer(null);
    setTimesTableStep(0);
    setSelectedTimesTableAnswer(null);
    setSelectedFactors([]);
    setSelectedWordAnswer(null);
    setSelectedRoundingAnswer(null);
    setSelectedMoneyAnswer(null);
    setSpeedMathStep(0);
    setSpeedMathTimer(6);
    setSpeedMathActive(false);
    setSpeedMathAnswers([]);

    // Part 3 states
    setSelectedPatternAnswer(null);
    setSelectedShapeAnswer(null);
    setSelectedGrowingAnswer(null);
    setSelectedMissingAnswer(null);
    setSequenceBlocksSorted([]);
    setSelectedRuleAnswer(null);
    setCurrentlySelectedKey(null);
    setMatchedPairs({});
    setClassificationStep(0);
    setSelectedBooleanAnswer(null);
    setSelectedConditionalAnswer(null);

    // Part 4 states
    setShapeStep(0);
    setSelectedShapePropertyAnswer(null);
    setShape2d3dStep(0);
    setSelectedSymmetryAnswer(null);
    setSelectedPositionDirectionAnswer(null);
    setRelativeMoveSequence([]);
    setRelativeMovePosition({ x: 2, y: 2 });
    setSelectedTurnsAnswer(null);
    setSelectedAnglesAnswer(null);
    setSelectedGridAnswer(null);
    setSelectedCartesianAnswer(null);
    setSelectedMapRoute([]);

    // Part 5 states
    setSelectedLengthAnswer(null);
    setSelectedHeightAnswer(null);
    setSelectedWeightAnswer(null);
    setSelectedTimeAnswer(null);
    setSelectedCalendarAnswer(null);
    setSelectedSpeedAnswer(null);
    setSelectedDistanceAnswer(null);
    setSelectedTemperatureAnswer(null);
    setSelectedAreaAnswer(null);
    setSelectedPerimeterAnswer(null);

    // Part 6 states
    setSelectedFractionWholeAnswer(null);
    setSelectedFractionEquivalenceAnswer(null);
    setSelectedFractionComparisonAnswer(null);
    setSelectedFractionAdditionAnswer(null);
    setSelectedDecimalBasicsAnswer(null);
    setSelectedDecimalMoneyAnswer(null);
    setSelectedPercentageBasicsAnswer(null);
    setSelectedPercentageDiscountAnswer(null);
    setSelectedRatioBasicsAnswer(null);
    setSelectedProportionBasicsAnswer(null);

    // Part 7 states
    setSelectedDataCollectingAnswer({});
    setSelectedDataTablesAnswer(null);
    setSelectedDataPictogramsAnswer(null);
    setSelectedDataBarChartsAnswer(null);
    setSelectedDataLineGraphsAnswer(null);
    setSelectedDataPieChartsAnswer(null);
    setSelectedDataMeanAnswer(null);
    setSelectedDataMedianAnswer(null);
    setSelectedDataModeAnswer(null);
    setSelectedDataInterpretationAnswer(null);

    // Part 8 states
    setSelectedAlgoStepsAnswer([]);
    setSelectedAlgoDecompositionAnswer([]);
    setSelectedAlgoBugsAnswer(null);
    setSelectedAlgoMathBugsAnswer(null);
    setSelectedAlgoLogicPuzzlesAnswer(null);
    setSelectedAlgoWordProblemsAnswer(null);
    setSelectedAlgoBrainTeasersAnswer(null);
    setSelectedAlgoStrategyAnswer(null);
    setSelectedAlgoFlowchartAnswer(null);
    setSelectedAlgoDesignAnswer(null);
  };

  const triggerError = () => {
    setShake(true);
    setSuccess(false);
    setTimeout(() => setShake(false), 500);
  };

  const triggerConfetti = () => {
    import('canvas-confetti').then((confetti) => {
      // First burst from center
      confetti.default({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
      // Side bursts
      setTimeout(() => {
        confetti.default({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
      }, 250);
      setTimeout(() => {
        confetti.default({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 400);
    });
  };

  const handleLevelComplete = () => {
    setSuccess(true);
    if (timerRef.current) clearInterval(timerRef.current);
    setSpeedMathActive(false);
    triggerConfetti();

    const nextGlobalLevel = currentPartIndex * 10 + currentLevelIndex + 1;
    if (nextGlobalLevel > maxUnlockedLevel) {
      setMaxUnlockedLevel(nextGlobalLevel);
      localStorage.setItem('stage1_progress', nextGlobalLevel.toString());
    }

    // Call backend to update progress if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/user/progress/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          stage: 1,
          progress: nextGlobalLevel
        })
      })
      .then(res => {
        if (!res.ok) throw new Error(`Network response was not ok: ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error("Response is not JSON");
      })
      .then(data => {
        if (data.success) {
          updateUser(data.user);
          setPointsEarned(data.points_earned);
          setStreakCount(data.current_streak);
          if (data.newly_unlocked_badges && data.newly_unlocked_badges.length > 0) {
            setNewlyUnlockedBadges(data.newly_unlocked_badges);
            setTimeout(() => {
              setShowBadgeCelebration(true);
            }, 2000);
          }
        }
      })
      .catch(err => console.error("Error updating progress on backend:", err));
    } else {
      setPointsEarned(0);
      setStreakCount(0);
    }

    setTimeout(() => {
      setShowModal(true);
    }, 800);
  };

  // Part 1 Puzzle Handlers
  const submitCounting = (answer: number) => {
    setSelectedCountingAnswer(answer);
    const challenge = level.gameData.steps[countingStep];
    if (answer === challenge.correctAnswer) {
      if (countingStep < level.gameData.steps.length - 1) {
        setTimeout(() => {
          setCountingStep(prev => prev + 1);
          setSelectedCountingAnswer(null);
        }, 800);
      } else {
        handleLevelComplete();
      }
    } else {
      triggerError();
    }
  };

  const submitRecognition = (answer: number) => {
    setSelectedRecognitionAnswer(answer);
    if (answer === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitComparison = (answer: string) => {
    setSelectedComparisonAnswer(answer);
    const challenge = level.gameData.challenges[comparisonStep];
    if (answer === challenge.correctAnswer) {
      if (comparisonStep < level.gameData.challenges.length - 1) {
        setTimeout(() => {
          setComparisonStep(prev => prev + 1);
          setSelectedComparisonAnswer(null);
        }, 800);
      } else {
        handleLevelComplete();
      }
    } else {
      triggerError();
    }
  };

  const handleSequenceClick = (n: number) => {
    if (sequencingSorted.includes(n)) return;
    const nextIdx = sequencingSorted.length;
    const expected = level.gameData.correctAnswer[nextIdx];
    
    if (n === expected) {
      const newList = [...sequencingSorted, n];
      setSequencingSorted(newList);
      if (newList.length === level.gameData.correctAnswer.length) {
        handleLevelComplete();
      }
    } else {
      triggerError();
      setSequencingSorted([]);
    }
  };

  const handleOddEvenSort = (port: 'odd' | 'even') => {
    const numbers = level.gameData.numbers;
    const currentNum = numbers[oddEvenIndex];
    const isEven = currentNum % 2 === 0;
    const correctPort = isEven ? 'even' : 'odd';
    
    const isCorrect = port === correctPort;
    const newHistory = [...oddEvenHistory, { num: currentNum, correct: isCorrect }];
    setOddEvenHistory(newHistory);
    
    if (isCorrect) {
      setOddEvenScore(prev => prev + 1);
    } else {
      triggerError();
    }

    if (oddEvenIndex < numbers.length - 1) {
      setOddEvenIndex(prev => prev + 1);
    } else {
      const finalScore = isCorrect ? oddEvenScore + 1 : oddEvenScore;
      if (finalScore >= 4) {
        handleLevelComplete();
      } else {
        setTimeout(() => {
          resetLevelState();
        }, 1500);
      }
    }
  };

  const submitPlaceValue = () => {
    const total = placeHundreds * 100 + placeTens * 10 + placeUnits;
    if (total === level.gameData.target) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitAddition = (answer: number) => {
    setSelectedAdditionAnswer(answer);
    if (answer === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitSubtraction = (answer: number) => {
    setSelectedSubtractionAnswer(answer);
    if (answer === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitBonds = (answer: number) => {
    setSelectedBondsAnswer(answer);
    if (answer === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitSkip = (answer: number) => {
    setSelectedSkipAnswer(answer);
    const challenge = level.gameData.challenges[skipStep];
    if (answer === challenge.correctAnswer) {
      if (skipStep < level.gameData.challenges.length - 1) {
        setTimeout(() => {
          setSkipStep(prev => prev + 1);
          setSelectedSkipAnswer(null);
        }, 800);
      } else {
        handleLevelComplete();
      }
    } else {
      triggerError();
    }
  };

  // Part 2 Puzzle Handlers
  const submitRegrouping = () => {
    const isCarryCorrect = additionCarry === true;
    const isUnitsCorrect = additionUnits === 3;
    const isTensCorrect = additionTens === 4;

    if (isCarryCorrect && isUnitsCorrect && isTensCorrect) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitBorrowing = () => {
    const isBorrowedCorrect = subtractionBorrowed === true;
    const isUnitsCorrect = subtractionUnits === 5;
    const isTensCorrect = subtractionTens === 2;

    if (isBorrowedCorrect && isUnitsCorrect && isTensCorrect) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitMultiplication = (answer: number) => {
    setSelectedMultiplicationAnswer(answer);
    if (answer === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitDivision = (answer: number) => {
    setSelectedDivisionAnswer(answer);
    if (answer === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitTimesTable = (answer: number) => {
    setSelectedTimesTableAnswer(answer);
    const challenge = level.gameData.challenges[timesTableStep];
    if (answer === challenge.correctAnswer) {
      if (timesTableStep < level.gameData.challenges.length - 1) {
        setTimeout(() => {
          setTimesTableStep(prev => prev + 1);
          setSelectedTimesTableAnswer(null);
        }, 800);
      } else {
        handleLevelComplete();
      }
    } else {
      triggerError();
    }
  };

  const toggleFactorSelect = (val: number) => {
    if (selectedFactors.includes(val)) {
      setSelectedFactors(prev => prev.filter(x => x !== val));
    } else {
      setSelectedFactors(prev => [...prev, val]);
    }
  };

  const submitFactors = () => {
    const correct = level.gameData.correctAnswers;
    const hasAllCorrect = correct.every((c: number) => selectedFactors.includes(c));
    const hasNoExtra = selectedFactors.every((s: number) => correct.includes(s));

    if (hasAllCorrect && hasNoExtra) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitWordProblem = (answer: number) => {
    setSelectedWordAnswer(answer);
    if (answer === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitRounding = (answer: number) => {
    setSelectedRoundingAnswer(answer);
    if (answer === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitMoney = (answer: number) => {
    setSelectedMoneyAnswer(answer);
    if (answer === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const startSpeedMath = () => {
    resetLevelState();
    setSpeedMathActive(true);
    setSpeedMathTimer(6);
  };

  const submitSpeedMath = (answer: number) => {
    const challenge = level.gameData.challenges[speedMathStep];
    if (answer === challenge.a) {
      const nextStep = speedMathStep + 1;
      if (nextStep < level.gameData.challenges.length) {
        setSpeedMathStep(nextStep);
        setSpeedMathTimer(6);
      } else {
        handleLevelComplete();
      }
    } else {
      triggerError();
      setSpeedMathActive(false);
      setSpeedMathStep(0);
    }
  };

  // Part 3 Handlers
  const submitNumberPattern = (answer: number) => {
    setSelectedPatternAnswer(answer);
    if (answer === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitShapePattern = (answer: string) => {
    setSelectedShapeAnswer(answer);
    if (answer === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitGrowingPattern = (answer: number) => {
    setSelectedGrowingAnswer(answer);
    if (answer === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitMissingPattern = (answer: number) => {
    setSelectedMissingAnswer(answer);
    if (answer === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const handleSequenceBlockClick = (block: string) => {
    if (sequenceBlocksSorted.includes(block)) return;
    const nextIdx = sequenceBlocksSorted.length;
    const expected = level.gameData.correctAnswer[nextIdx];
    
    if (block === expected) {
      const newList = [...sequenceBlocksSorted, block];
      setSequenceBlocksSorted(newList);
      if (newList.length === level.gameData.correctAnswer.length) {
        handleLevelComplete();
      }
    } else {
      triggerError();
      setSequenceBlocksSorted([]);
    }
  };

  const submitRulePattern = (answer: number) => {
    setSelectedRuleAnswer(answer);
    if (answer === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const selectMatchingKey = (key: string) => {
    if (matchedPairs[key]) return;
    setCurrentlySelectedKey(key);
  };

  const selectMatchingVal = (val: string) => {
    if (!currentlySelectedKey) return;
    const pair = level.gameData.matches.find((m: any) => m.key === currentlySelectedKey);
    if (pair && pair.val === val) {
      setMatchedPairs(prev => {
        const updated = { ...prev, [currentlySelectedKey!]: val };
        if (Object.keys(updated).length === level.gameData.matches.length) {
          handleLevelComplete();
        }
        return updated;
      });
      setCurrentlySelectedKey(null);
    } else {
      triggerError();
      setCurrentlySelectedKey(null);
    }
  };

  const submitClassification = (category: string) => {
    const currentItem = level.gameData.items[classificationStep];
    if (category === currentItem.category) {
      if (classificationStep < level.gameData.items.length - 1) {
        setClassificationStep(prev => prev + 1);
      } else {
        handleLevelComplete();
      }
    } else {
      triggerError();
    }
  };

  const submitBooleanStatement = (answer: boolean) => {
    setSelectedBooleanAnswer(answer);
    if (answer === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitConditionalReasoning = (answer: number) => {
    setSelectedConditionalAnswer(answer);
    if (answer === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  // Part 4 Handlers
  const submitShapeProperty = (ans: string) => {
    setSelectedShapePropertyAnswer(ans);
    const currentChallenge = level.gameData.properties[shapeStep];
    if (ans === currentChallenge.correctAnswer) {
      if (shapeStep < level.gameData.properties.length - 1) {
        setTimeout(() => {
          setShapeStep(prev => prev + 1);
          setSelectedShapePropertyAnswer(null);
        }, 800);
      } else {
        handleLevelComplete();
      }
    } else {
      triggerError();
    }
  };

  const submit2d3dClassification = (type: string) => {
    const currentItem = level.gameData.items[shape2d3dStep];
    if (type === currentItem.type) {
      if (shape2d3dStep < level.gameData.items.length - 1) {
        setShape2d3dStep(prev => prev + 1);
      } else {
        handleLevelComplete();
      }
    } else {
      triggerError();
    }
  };

  const submitSymmetry = (ans: boolean[]) => {
    setSelectedSymmetryAnswer(ans);
    const correct = level.gameData.correctAnswer;
    const isCorrect = correct.length === ans.length && correct.every((val: boolean, i: number) => val === ans[i]);
    if (isCorrect) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitPositionDirection = (ans: string) => {
    setSelectedPositionDirectionAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const addRelativeMove = (dir: string) => {
    if (relativeMoveSequence.length >= 5) return;
    setRelativeMoveSequence(prev => [...prev, dir]);
  };

  const runRelativeMoves = () => {
    let curPos = { x: 2, y: 2 };
    for (const move of relativeMoveSequence) {
      if (move === "Up") curPos.y -= 1;
      if (move === "Down") curPos.y += 1;
      if (move === "Left") curPos.x -= 1;
      if (move === "Right") curPos.x += 1;
    }
    setRelativeMovePosition(curPos);
    const target = level.gameData.correctAnswer;
    if (curPos.x === target.x && curPos.y === target.y) {
      handleLevelComplete();
    } else {
      triggerError();
      setRelativeMoveSequence([]);
      setRelativeMovePosition({ x: 2, y: 2 });
    }
  };

  const submitTurnAngle = (ans: number) => {
    setSelectedTurnsAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitAngleType = (ans: string) => {
    setSelectedAnglesAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitGridSelection = (ans: string) => {
    setSelectedGridAnswer(ans);
    if (ans === "Row 2, Col 3") {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitCartesianCoordinate = (ans: string) => {
    setSelectedCartesianAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const handleMapNodeClick = (node: string) => {
    if (selectedMapRoute.includes(node)) return;
    const nextIdx = selectedMapRoute.length;
    const expected = level.gameData.correctAnswer[nextIdx];
    if (node === expected) {
      const newList = [...selectedMapRoute, node];
      setSelectedMapRoute(newList);
      if (newList.length === level.gameData.correctAnswer.length) {
        handleLevelComplete();
      }
    } else {
      triggerError();
      setSelectedMapRoute([]);
    }
  };

  const proceedToNextLevel = () => {
    const globalIdx = currentPartIndex * 10 + currentLevelIndex;
    if (globalIdx < 79) {
      const nextGlobalIdx = globalIdx + 1;
      setCurrentPartIndex(Math.min(7, Math.floor(nextGlobalIdx / 10)));
      setCurrentLevelIndex(nextGlobalIdx % 10);
    }
  };

  const handleNextLevel = () => {
    setShowModal(false);
    // Trigger feedback form if completing a part (index 9 means 10th level of the part)
    if (currentLevelIndex === 9) {
      setShowFeedbackModal(true);
    } else {
      proceedToNextLevel();
    }
  };

  const handleFeedbackClose = () => {
    setShowFeedbackModal(false);
    const globalIdx = currentPartIndex * 10 + currentLevelIndex;
    if (globalIdx < 79) {
      proceedToNextLevel();
    } else {
      router.push('/stage2');
    }
  };

  const selectPart = (partIdx: number) => {
    setCurrentPartIndex(partIdx);
    setCurrentLevelIndex(0);
  };

  const submitLength = (ans: number) => {
    setSelectedLengthAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitHeight = (ans: string) => {
    setSelectedHeightAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitWeight = (ans: number) => {
    setSelectedWeightAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitTime = (ans: string) => {
    setSelectedTimeAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitCalendar = (ans: string) => {
    setSelectedCalendarAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitSpeed = (ans: number) => {
    setSelectedSpeedAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitDistance = (ans: number) => {
    setSelectedDistanceAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitTemperature = (ans: number) => {
    setSelectedTemperatureAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitArea = (ans: number) => {
    setSelectedAreaAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitPerimeter = (ans: number) => {
    setSelectedPerimeterAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  // Part 6 Puzzle Handlers
  const submitFractionWhole = (ans: string) => {
    setSelectedFractionWholeAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitFractionEquivalence = (ans: string) => {
    setSelectedFractionEquivalenceAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitFractionComparison = (ans: string) => {
    setSelectedFractionComparisonAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitFractionAddition = (ans: string) => {
    setSelectedFractionAdditionAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitDecimalBasics = (ans: number) => {
    setSelectedDecimalBasicsAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitDecimalMoney = (ans: number) => {
    setSelectedDecimalMoneyAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitPercentageBasics = (ans: number) => {
    setSelectedPercentageBasicsAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitPercentageDiscount = (ans: number) => {
    setSelectedPercentageDiscountAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitRatioBasics = (ans: string) => {
    setSelectedRatioBasicsAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitProportionBasics = (ans: number) => {
    setSelectedProportionBasicsAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  // Part 7 Puzzle Handlers
  const submitDataCollecting = (category: 'A' | 'B' | 'C', val: number) => {
    const updated = { ...selectedDataCollectingAnswer, [category]: val };
    setSelectedDataCollectingAnswer(updated);
    
    const expected = level.gameData.correctAnswer;
    if (updated.A === expected.A && updated.B === expected.B && updated.C === expected.C) {
      handleLevelComplete();
    } else {
      if (updated.A !== undefined && updated.B !== undefined && updated.C !== undefined) {
        triggerError();
      }
    }
  };

  const submitDataTables = (ans: string) => {
    setSelectedDataTablesAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitDataPictograms = (ans: number) => {
    setSelectedDataPictogramsAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitDataBarCharts = (ans: string) => {
    setSelectedDataBarChartsAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitDataLineGraphs = (ans: number) => {
    setSelectedDataLineGraphsAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitDataPieCharts = (ans: string) => {
    setSelectedDataPieChartsAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitDataMean = (ans: number) => {
    setSelectedDataMeanAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitDataMedian = (ans: number) => {
    setSelectedDataMedianAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitDataMode = (ans: number) => {
    setSelectedDataModeAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitDataInterpretation = (ans: number) => {
    setSelectedDataInterpretationAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  // Part 8 Puzzle Handlers
  const toggleAlgoStepSelection = (step: string) => {
    let nextSeq = [...selectedAlgoStepsAnswer];
    if (nextSeq.includes(step)) {
      nextSeq = nextSeq.filter(s => s !== step);
    } else {
      nextSeq.push(step);
    }
    setSelectedAlgoStepsAnswer(nextSeq);
  };

  const submitAlgoSteps = () => {
    const isCorrect = selectedAlgoStepsAnswer.length === level.gameData.correctAnswer.length &&
      selectedAlgoStepsAnswer.every((val, i) => val === level.gameData.correctAnswer[i]);
    if (isCorrect) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const toggleAlgoDecompositionSelection = (step: string) => {
    let nextSeq = [...selectedAlgoDecompositionAnswer];
    if (nextSeq.includes(step)) {
      nextSeq = nextSeq.filter(s => s !== step);
    } else {
      nextSeq.push(step);
    }
    setSelectedAlgoDecompositionAnswer(nextSeq);
  };

  const submitAlgoDecomposition = () => {
    const isCorrect = selectedAlgoDecompositionAnswer.length === level.gameData.correctAnswer.length &&
      selectedAlgoDecompositionAnswer.every(val => level.gameData.correctAnswer.includes(val));
    if (isCorrect) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitAlgoBugs = (ans: string) => {
    setSelectedAlgoBugsAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitAlgoMathBugs = (ans: string) => {
    setSelectedAlgoMathBugsAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitAlgoLogicPuzzles = (ans: string) => {
    setSelectedAlgoLogicPuzzlesAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitAlgoWordProblems = (ans: number) => {
    setSelectedAlgoWordProblemsAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitAlgoBrainTeasers = (ans: number) => {
    setSelectedAlgoBrainTeasersAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitAlgoStrategy = (ans: string) => {
    setSelectedAlgoStrategyAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitAlgoFlowchart = (ans: number) => {
    setSelectedAlgoFlowchartAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  const submitAlgoDesign = (ans: string) => {
    setSelectedAlgoDesignAnswer(ans);
    if (ans === level.gameData.correctAnswer) {
      handleLevelComplete();
    } else {
      triggerError();
    }
  };

  // Renderers for different games
  const renderGameArea = () => {
    switch (level.gameType) {
      // PART 1 RENDERERS
      case 'counting': {
        const step = level.gameData.steps[countingStep];
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              {step.label} Challenge ({countingStep + 1}/2)
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-10 max-w-full">
              {step.sequence.map((n: number | null, i: number) => (
                <div 
                  key={i} 
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-lg sm:text-2xl font-black border-2 sm:border-4 shadow-md transition-all
                    ${n === null 
                      ? 'bg-yellow-50 border-dashed border-yellow-400 text-yellow-500 animate-pulse w-14 h-14 sm:w-20 sm:h-20' 
                      : 'bg-white border-slate-200 text-slate-800'}`}
                >
                  {n === null ? '?' : n}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-sm">
              {step.options.map((opt: number) => {
                const isSelected = selectedCountingAnswer === opt;
                const isCorrect = opt === step.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedCountingAnswer !== null}
                    onClick={() => submitCounting(opt)}
                    className={`py-4 rounded-2xl font-black text-xl border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedCountingAnswer === null 
                        ? 'bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-white border-sky-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'recognition': {
        const grid = level.gameData.grid;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Register Matrix Scan
            </h4>
            <div className="grid grid-cols-3 gap-3 mb-10 bg-slate-800 p-4 rounded-3xl border-4 border-slate-700 shadow-inner">
              {grid.map((active: boolean, i: number) => (
                <div 
                  key={i} 
                  className={`w-12 h-12 rounded-xl transition-all duration-300 border-2
                    ${active 
                      ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.8)] scale-105' 
                      : 'bg-slate-900 border-slate-850 opacity-40'}`}
                />
              ))}
            </div>
            <p className="text-slate-500 font-bold mb-4">How many active green cells are there?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedRecognitionAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedRecognitionAnswer !== null}
                    onClick={() => submitRecognition(opt)}
                    className={`py-4 rounded-2xl font-black text-xl border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedRecognitionAnswer === null 
                        ? 'bg-gradient-to-b from-purple-400 to-purple-500 hover:from-purple-300 hover:to-purple-400 text-white border-purple-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'comparison': {
        const challenge = level.gameData.challenges[comparisonStep];
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Logic Comparison Gate ({comparisonStep + 1}/3)
            </h4>
            <div className="flex items-center justify-center gap-6 mb-10 w-full max-w-md">
              <div className="w-28 h-28 rounded-3xl bg-slate-950 border-4 border-indigo-500 flex flex-col items-center justify-center shadow-lg">
                <span className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">PORT A</span>
                <span className="text-3xl font-black text-white">{challenge.left}</span>
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-dashed border-yellow-400 flex items-center justify-center bg-yellow-50 text-3xl font-black text-yellow-600 animate-pulse">
                {selectedComparisonAnswer || '?'}
              </div>
              <div className="w-28 h-28 rounded-3xl bg-slate-950 border-4 border-indigo-500 flex flex-col items-center justify-center shadow-lg">
                <span className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">PORT B</span>
                <span className="text-3xl font-black text-white">{challenge.right}</span>
              </div>
            </div>
            <div className="flex justify-center gap-6 w-full max-w-sm">
              {['<', '>', '='].map((opt) => {
                const isSelected = selectedComparisonAnswer === opt;
                const isCorrect = opt === challenge.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedComparisonAnswer !== null}
                    onClick={() => submitComparison(opt)}
                    className={`w-20 h-20 rounded-2xl font-black text-3xl border-4 transition-all shadow-md transform hover:scale-105 active:scale-95 flex items-center justify-center
                      ${selectedComparisonAnswer === null 
                        ? 'bg-gradient-to-b from-pink-400 to-pink-500 hover:from-pink-300 hover:to-pink-400 text-white border-pink-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'sequencing': {
        const raw = level.gameData.items;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Execution Queue Compiler
            </h4>
            <p className="text-slate-500 font-medium text-center mb-6 max-w-md">
              Click the instruction data packets in order from **smallest to largest** to compile the thread!
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-10 w-full max-w-md">
              {raw.map((n: number) => {
                const isAdded = sequencingSorted.includes(n);
                return (
                  <button
                    key={n}
                    onClick={() => handleSequenceClick(n)}
                    disabled={isAdded}
                    className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-4 shadow-md font-black text-2xl transition-all transform hover:scale-105
                      ${isAdded 
                        ? 'bg-emerald-500 border-emerald-700 text-white opacity-60 scale-95 cursor-not-allowed' 
                        : 'bg-white border-indigo-200 text-indigo-700 hover:border-indigo-400'}`}
                  >
                    <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">VAL</span>
                    {n}
                  </button>
                );
              })}
            </div>
            <div className="w-full max-w-md bg-slate-900 rounded-2xl p-4 border-2 border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Compiled Queue</span>
              <div className="flex gap-2 min-h-[48px]">
                {sequencingSorted.map((n, i) => (
                  <div key={i} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg font-black border border-emerald-500 flex items-center justify-center">
                    {n}
                  </div>
                ))}
                {sequencingSorted.length === 0 && (
                  <span className="text-slate-600 font-medium italic flex items-center text-sm">Queue is empty...</span>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'odd-even': {
        const numbers = level.gameData.numbers;
        const currentNum = numbers[oddEvenIndex];
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Modulo Packet Classifier ({oddEvenIndex + 1}/{numbers.length})
            </h4>
            <div className="w-full max-w-md bg-slate-950 p-6 rounded-3xl border-4 border-slate-800 shadow-inner flex flex-col items-center mb-8 relative overflow-hidden">
              <div className="absolute top-2 left-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Conveyor Belt</div>
              <div className="w-24 h-24 bg-gradient-to-r from-orange-400 to-amber-500 rounded-2xl flex flex-col items-center justify-center text-white border-4 border-white shadow-lg animate-bounce mb-4">
                <span className="text-[10px] font-black uppercase text-amber-100">DATA</span>
                <span className="text-4xl font-black">{currentNum}</span>
              </div>
              <div className="flex gap-2">
                {oddEvenHistory.map((hist, idx) => (
                  <div 
                    key={idx} 
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white
                      ${hist.correct ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  >
                    {hist.correct ? '✓' : '✗'}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
              <button
                onClick={() => handleOddEvenSort('even')}
                className="py-5 bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-300 hover:to-blue-400 border-4 border-blue-600 text-white rounded-2xl font-black text-xl shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                EVEN PORT
                <span className="block text-xs font-bold text-blue-100 mt-1">Remainder = 0</span>
              </button>
              <button
                onClick={() => handleOddEvenSort('odd')}
                className="py-5 bg-gradient-to-b from-purple-400 to-purple-500 hover:from-purple-300 hover:to-purple-400 border-4 border-purple-600 text-white rounded-2xl font-black text-xl shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                ODD PORT
                <span className="block text-xs font-bold text-purple-100 mt-1">Remainder = 1</span>
              </button>
            </div>
          </div>
        );
      }

      case 'place-value': {
        const target = level.gameData.target;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Database Register Allocator
            </h4>
            <div className="bg-sky-50 border-4 border-dashed border-sky-200 rounded-3xl p-6 mb-8 text-center w-full max-w-md">
              <span className="text-xs font-black text-sky-600 uppercase tracking-widest">Target Value</span>
              <h5 className="text-5xl font-black text-slate-800 tracking-wider mt-1">{target}</h5>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-md">
              <div className="flex flex-col items-center bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hundreds</span>
                <span className="text-3xl font-black text-slate-800">{placeHundreds}</span>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setPlaceHundreds(p => Math.max(0, p - 1))} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center">-</button>
                  <button onClick={() => setPlaceHundreds(p => p + 1)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center">+</button>
                </div>
              </div>
              <div className="flex flex-col items-center bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tens</span>
                <span className="text-3xl font-black text-slate-800">{placeTens}</span>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setPlaceTens(p => Math.max(0, p - 1))} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center">-</button>
                  <button onClick={() => setPlaceTens(p => p + 1)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center">+</button>
                </div>
              </div>
              <div className="flex flex-col items-center bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Units</span>
                <span className="text-3xl font-black text-slate-800">{placeUnits}</span>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setPlaceUnits(p => Math.max(0, p - 1))} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center">-</button>
                  <button onClick={() => setPlaceUnits(p => p + 1)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center">+</button>
                </div>
              </div>
            </div>
            <button
              onClick={submitPlaceValue}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-lg rounded-2xl shadow-lg border-b-4 border-emerald-700 w-full max-w-sm hover:scale-105 active:scale-95 transition-transform"
            >
              COMPILE REGISTERS
            </button>
          </div>
        );
      }

      case 'addition': {
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              ALU Signal Integrator
            </h4>
            <div className="flex items-center justify-center gap-6 mb-10 w-full max-w-md">
              <div className="w-24 h-24 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex flex-col items-center justify-center shadow-inner">
                <span className="text-xs font-bold text-slate-400">INPUT A</span>
                <span className="text-3xl font-black text-slate-800">{level.gameData.num1}</span>
              </div>
              <span className="text-4xl font-black text-indigo-500">+</span>
              <div className="w-24 h-24 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex flex-col items-center justify-center shadow-inner">
                <span className="text-xs font-bold text-slate-400">INPUT B</span>
                <span className="text-3xl font-black text-slate-800">{level.gameData.num2}</span>
              </div>
            </div>
            <p className="text-slate-500 font-bold mb-4">Select the compiled output sum:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedAdditionAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedAdditionAnswer !== null}
                    onClick={() => submitAddition(opt)}
                    className={`py-4 rounded-2xl font-black text-xl border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedAdditionAnswer === null 
                        ? 'bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-white border-sky-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'subtraction': {
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Coolant Decrement Node
            </h4>
            <div className="flex items-center justify-center gap-6 mb-10 w-full max-w-md">
              <div className="w-24 h-24 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex flex-col items-center justify-center shadow-inner">
                <span className="text-xs font-bold text-slate-400">POWER</span>
                <span className="text-3xl font-black text-slate-800">{level.gameData.start}</span>
              </div>
              <span className="text-4xl font-black text-indigo-500">-</span>
              <div className="w-24 h-24 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex flex-col items-center justify-center shadow-inner">
                <span className="text-xs font-bold text-slate-400">DRAIN</span>
                <span className="text-3xl font-black text-slate-800">{level.gameData.subtract}</span>
              </div>
            </div>
            <p className="text-slate-500 font-bold mb-4">Input the balanced reactor charge:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedSubtractionAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedSubtractionAnswer !== null}
                    onClick={() => submitSubtraction(opt)}
                    className={`py-4 rounded-2xl font-black text-xl border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedSubtractionAnswer === null 
                        ? 'bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-white border-sky-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'bonds': {
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Firewall Complement Connector
            </h4>
            <div className="bg-slate-900 border-4 border-slate-800 rounded-3xl p-6 mb-8 text-center w-full max-w-md relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-2 left-3 text-[9px] font-black text-slate-500 tracking-widest uppercase">Firewall Target</div>
              <div className="w-20 h-20 rounded-full border-4 border-yellow-400 flex items-center justify-center text-white bg-yellow-500/10 font-black text-3xl shadow-inner mb-4">
                {level.gameData.target}
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="px-4 py-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500 rounded-lg font-black text-sm">
                  Active node: {level.gameData.value}
                </div>
                <span className="text-white font-black text-lg">+</span>
                <div className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500 border-dashed rounded-lg font-black animate-pulse text-sm">
                  {selectedBondsAnswer || '?'}
                </div>
              </div>
            </div>
            <p className="text-slate-500 font-bold mb-4">Select the complement node key to reach 10:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedBondsAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedBondsAnswer !== null}
                    onClick={() => submitBonds(opt)}
                    className={`py-4 rounded-2xl font-black text-xl border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedBondsAnswer === null 
                        ? 'bg-gradient-to-b from-purple-400 to-purple-500 hover:from-purple-300 hover:to-purple-400 text-white border-purple-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'skip-counting': {
        const challenge = level.gameData.challenges[skipStep];
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Skip-Loop Sequence ({skipStep + 1}/3)
            </h4>
            <p className="text-slate-400 text-sm font-bold mb-6">Skip count by {challenge.step}s</p>
            <div className="flex items-center gap-4 mb-10">
              {challenge.sequence.map((n: number | null, i: number) => (
                <div 
                  key={i} 
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border-4 shadow-md transition-all
                    ${n === null 
                      ? 'bg-yellow-50 border-dashed border-yellow-400 text-yellow-500 animate-pulse w-20 h-20' 
                      : 'bg-white border-slate-200 text-slate-800'}`}
                >
                  {n === null ? '?' : n}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-sm">
              {challenge.options.map((opt: number) => {
                const isSelected = selectedSkipAnswer === opt;
                const isCorrect = opt === challenge.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedSkipAnswer !== null}
                    onClick={() => submitSkip(opt)}
                    className={`py-4 rounded-2xl font-black text-xl border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedSkipAnswer === null 
                        ? 'bg-gradient-to-b from-pink-400 to-pink-500 hover:from-pink-300 hover:to-pink-400 text-white border-pink-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      // PART 2 RENDERERS
      case 'addition-regrouping': {
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Double-Digit Carry Register
            </h4>
            
            <div className="flex flex-col items-center bg-slate-900 border-4 border-slate-800 p-8 rounded-3xl text-white font-mono text-3xl mb-8 relative w-full max-w-sm shadow-inner">
              <div className="grid grid-cols-3 gap-x-6 gap-y-2 items-center text-right w-36">
                {/* Carry Row */}
                <div className="text-sm text-slate-400 font-bold">CARRY:</div>
                <button 
                  onClick={() => setAdditionCarry(prev => prev === true ? null : true)} 
                  className={`w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center border-2 transition-all
                    ${additionCarry === true 
                      ? 'bg-yellow-400 border-yellow-300 text-slate-900 font-black shadow-[0_0_10px_rgba(250,204,21,0.5)]' 
                      : 'bg-slate-800 border-dashed border-slate-600 text-slate-500 hover:border-slate-400'}`}
                >
                  {additionCarry === true ? '+1' : '?'}
                </button>
                <div />

                {/* Num 1 */}
                <div />
                <div className="font-black text-indigo-400">2</div>
                <div className="font-black text-indigo-400">8</div>

                {/* Num 2 */}
                <div className="font-black text-pink-500 text-left">+</div>
                <div className="font-black text-pink-500">1</div>
                <div className="font-black text-pink-500">5</div>

                {/* Divider */}
                <div className="col-span-3 border-b-4 border-slate-700 my-1"></div>

                {/* Answer Row */}
                <div className="text-sm text-slate-400 font-bold">OUT:</div>
                {/* Tens Digit */}
                <div className="flex justify-end">
                  <select 
                    value={additionTens ?? ''} 
                    onChange={(e) => setAdditionTens(e.target.value ? parseInt(e.target.value, 10) : null)}
                    className="w-12 h-12 bg-slate-800 border-2 border-indigo-500 rounded-xl text-center text-2xl font-black text-white cursor-pointer focus:outline-none focus:border-indigo-400"
                  >
                    <option value="">?</option>
                    {[2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                {/* Units Digit */}
                <div className="flex justify-end">
                  <select 
                    value={additionUnits ?? ''} 
                    onChange={(e) => setAdditionUnits(e.target.value ? parseInt(e.target.value, 10) : null)}
                    className="w-12 h-12 bg-slate-800 border-2 border-pink-500 rounded-xl text-center text-2xl font-black text-white cursor-pointer focus:outline-none focus:border-pink-400"
                  >
                    <option value="">?</option>
                    {[1, 2, 3, 5, 8].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={submitRegrouping}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-lg rounded-2xl shadow-lg w-full max-w-sm hover:scale-105 active:scale-95 transition-transform"
            >
              VERIFY ALU REGISTER
            </button>
          </div>
        );
      }

      case 'subtraction-borrowing': {
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Borrow Operator Core
            </h4>
            <p className="text-slate-500 font-medium text-center mb-6 max-w-md text-sm">
              Since 2 units is smaller than 7, click **BORROW 1 TEN** to convert 1 Ten into 10 Units before calculating!
            </p>
            
            <div className="flex flex-col items-center bg-slate-900 border-4 border-slate-800 p-8 rounded-3xl text-white font-mono text-3xl mb-6 relative w-full max-w-sm shadow-inner">
              <div className="grid grid-cols-3 gap-x-6 gap-y-2 items-center text-right w-36">
                {/* Num 1 */}
                <div />
                <div className={`font-black transition-all ${subtractionBorrowed ? 'line-through text-slate-600 text-2xl' : 'text-indigo-400'}`}>4</div>
                <div className="font-black text-indigo-400">2</div>

                {/* Subtraction borrow row if active */}
                {subtractionBorrowed && (
                  <>
                    <div className="text-[10px] text-yellow-400 font-black uppercase text-left leading-none">REG UPDATE:</div>
                    <div className="text-xl font-black text-yellow-400">3</div>
                    <div className="text-xl font-black text-yellow-400">12</div>
                  </>
                )}

                {/* Num 2 */}
                <div className="font-black text-pink-500 text-left">-</div>
                <div className="font-black text-pink-500">1</div>
                <div className="font-black text-pink-500">7</div>

                {/* Divider */}
                <div className="col-span-3 border-b-4 border-slate-700 my-1"></div>

                {/* Answer Row */}
                <div className="text-sm text-slate-400 font-bold">OUT:</div>
                {/* Tens Digit */}
                <div className="flex justify-end">
                  <select 
                    value={subtractionTens ?? ''} 
                    onChange={(e) => setSubtractionTens(e.target.value ? parseInt(e.target.value, 10) : null)}
                    className="w-12 h-12 bg-slate-800 border-2 border-indigo-500 rounded-xl text-center text-2xl font-black text-white cursor-pointer focus:outline-none focus:border-indigo-400"
                  >
                    <option value="">?</option>
                    {[1, 2, 3, 5].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                {/* Units Digit */}
                <div className="flex justify-end">
                  <select 
                    value={subtractionUnits ?? ''} 
                    onChange={(e) => setSubtractionUnits(e.target.value ? parseInt(e.target.value, 10) : null)}
                    className="w-12 h-12 bg-slate-800 border-2 border-pink-500 rounded-xl text-center text-2xl font-black text-white cursor-pointer focus:outline-none focus:border-pink-400"
                  >
                    <option value="">?</option>
                    {[2, 3, 5, 7].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
              <button
                onClick={() => setSubtractionBorrowed(prev => !prev)}
                className={`flex-1 py-4 rounded-2xl font-black text-sm border-4 shadow-md transition-all
                  ${subtractionBorrowed 
                    ? 'bg-yellow-500 border-yellow-700 text-white' 
                    : 'bg-white border-yellow-400 text-yellow-600 hover:bg-yellow-50'}`}
              >
                {subtractionBorrowed ? '✓ TEN BORROWED' : '⚡ BORROW 1 TEN'}
              </button>
              <button
                onClick={submitBorrowing}
                className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-4 border-indigo-700 text-white rounded-2xl font-black text-sm shadow-md hover:scale-105 active:scale-95 transition-transform"
              >
                VERIFY RESULT
              </button>
            </div>
          </div>
        );
      }

      case 'multiplication-basics': {
        const factor1 = level.gameData.factor1;
        const factor2 = level.gameData.factor2;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Repeated Addition Loop Analyzer
            </h4>
            <p className="text-indigo-600 font-bold mb-6 text-center text-sm">
              `3 x 4` in code executes a loop adding 4 units, 3 separate times!
            </p>

            <div className="flex gap-6 mb-10">
              {Array.from({ length: factor1 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center bg-indigo-50 border-2 border-indigo-200 p-4 rounded-2xl shadow-sm relative">
                  <span className="text-[10px] text-indigo-400 font-black uppercase mb-2">Iter {i+1}</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Array.from({ length: factor2 }).map((_, j) => (
                      <div key={j} className="w-5 h-5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-slate-500 font-bold mb-4">What is the total of all loop iterations?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedMultiplicationAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedMultiplicationAnswer !== null}
                    onClick={() => submitMultiplication(opt)}
                    className={`py-4 rounded-2xl font-black text-xl border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedMultiplicationAnswer === null 
                        ? 'bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-white border-sky-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'division-basics': {
        const total = level.gameData.total;
        const divisor = level.gameData.divisor;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              CPU Load Balance Distributor
            </h4>
            <p className="text-slate-500 font-medium text-center mb-6 max-w-md text-sm">
              Distribute {total} incoming tasks evenly among the {divisor} server ports below.
            </p>

            <div className="flex gap-6 mb-10">
              {Array.from({ length: divisor }).map((_, i) => (
                <div key={i} className="w-24 h-28 rounded-2xl border-2 border-dashed border-pink-300 bg-pink-50/50 flex flex-col items-center p-2 relative">
                  <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-2">SERVER {i+1}</span>
                  {selectedDivisionAnswer !== null && selectedDivisionAnswer === level.gameData.correctAnswer && (
                    <div className="grid grid-cols-2 gap-1.5 animate-in zoom-in duration-300">
                      {Array.from({ length: level.gameData.correctAnswer }).map((_, j) => (
                        <div key={j} className="w-4 h-4 bg-pink-500 rounded-full" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-slate-500 font-bold mb-4">How many tasks does each server receive?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedDivisionAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedDivisionAnswer !== null}
                    onClick={() => submitDivision(opt)}
                    className={`py-4 rounded-2xl font-black text-xl border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedDivisionAnswer === null 
                        ? 'bg-gradient-to-b from-pink-400 to-pink-500 hover:from-pink-300 hover:to-pink-400 text-white border-pink-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'times-tables': {
        const challenge = level.gameData.challenges[timesTableStep];
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Lookup Table Stream ({timesTableStep + 1}/3)
            </h4>

            <div className="w-48 h-48 bg-slate-900 border-4 border-slate-800 rounded-3xl flex flex-col items-center justify-center text-white mb-8 shadow-lg">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">DB QUERY</span>
              <span className="text-4xl font-black">{challenge.question}</span>
            </div>

            <p className="text-slate-500 font-bold mb-4">Select the correct matching product:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
              {challenge.options.map((opt: number) => {
                const isSelected = selectedTimesTableAnswer === opt;
                const isCorrect = opt === challenge.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedTimesTableAnswer !== null}
                    onClick={() => submitTimesTable(opt)}
                    className={`py-4 rounded-2xl font-black text-xl border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedTimesTableAnswer === null 
                        ? 'bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-white border-sky-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'factors-multiples': {
        const target = level.gameData.target;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Factor Filter Compiler
            </h4>
            <p className="text-slate-500 font-medium text-center mb-6 max-w-md text-sm">
              Select all divisor packets that leave a remainder of **0** when dividing target **{target}**.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8 w-full max-w-md">
              {level.gameData.items.map((n: number) => {
                const isSelected = selectedFactors.includes(n);
                return (
                  <button
                    key={n}
                    onClick={() => toggleFactorSelect(n)}
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-4 shadow-md font-black text-lg transition-all transform hover:scale-105
                      ${isSelected 
                        ? 'bg-indigo-500 border-indigo-700 text-white scale-105' 
                        : 'bg-white border-indigo-100 text-indigo-700 hover:border-indigo-300'}`}
                  >
                    <span className={`text-[8px] font-bold uppercase mb-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>DIV</span>
                    {n}
                  </button>
                );
              })}
            </div>

            <button
              onClick={submitFactors}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-lg rounded-2xl shadow-lg border-b-4 border-emerald-700 w-full max-w-sm hover:scale-105 active:scale-95 transition-transform"
            >
              COMPILE FILTER
            </button>
          </div>
        );
      }

      case 'word-problems': {
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Algorithm Word Parser
            </h4>
            
            <div className="bg-slate-900 border-4 border-slate-800 rounded-3xl p-6 mb-8 text-white font-mono text-sm leading-relaxed max-w-md shadow-inner w-full relative">
              <div className="absolute top-2 left-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Compiler Spec</div>
              <p className="mt-2 text-slate-300">{level.gameData.question}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedWordAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedWordAnswer !== null}
                    onClick={() => submitWordProblem(opt)}
                    className={`py-4 rounded-2xl font-black text-xl border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedWordAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-400 to-indigo-500 hover:from-indigo-300 hover:to-indigo-400 text-white border-indigo-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'estimation-rounding': {
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Signal Decimal Rounder
            </h4>

            <div className="bg-sky-50 border-4 border-dashed border-sky-200 rounded-3xl p-6 mb-8 text-center w-full max-w-xs">
              <span className="text-xs font-black text-sky-600 uppercase tracking-widest">Sensor Float</span>
              <h5 className="text-5xl font-black text-slate-800 mt-1">{level.gameData.value}.347</h5>
            </div>

            <p className="text-slate-500 font-bold mb-4">Round the sensor value to the nearest ten:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedRoundingAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedRoundingAnswer !== null}
                    onClick={() => submitRounding(opt)}
                    className={`py-4 rounded-2xl font-black text-xl border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedRoundingAnswer === null 
                        ? 'bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-white border-sky-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'money-calculations': {
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              E-Commerce Ledger Auditor
            </h4>

            <div className="flex justify-center gap-6 mb-8 w-full max-w-md">
              <div className="flex-1 bg-pink-50 border-2 border-pink-100 p-4 rounded-2xl shadow-sm text-center">
                <span className="text-[10px] text-pink-500 font-black uppercase tracking-wider block mb-1">Item Cost</span>
                <span className="text-2xl font-black text-slate-700">${level.gameData.price.toFixed(2)}</span>
              </div>
              <div className="flex-1 bg-emerald-50 border-2 border-emerald-100 p-4 rounded-2xl shadow-sm text-center">
                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-wider block mb-1">Paid Amount</span>
                <span className="text-2xl font-black text-slate-700">${level.gameData.paid.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-slate-500 font-bold mb-4">Calculate the remaining change balance due:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedMoneyAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedMoneyAnswer !== null}
                    onClick={() => submitMoney(opt)}
                    className={`py-4 rounded-2xl font-black text-base border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedMoneyAnswer === null 
                        ? 'bg-gradient-to-b from-purple-400 to-purple-500 hover:from-purple-300 hover:to-purple-400 text-white border-purple-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    ${opt.toFixed(2)}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'speed-maths': {
        const challenge = level.gameData.challenges[speedMathStep];
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              CPU Speed Loop ({speedMathStep + 1}/3)
            </h4>

            {!speedMathActive ? (
              <div className="text-center py-6">
                <p className="text-slate-500 font-medium mb-6 max-w-sm text-sm">
                  Solve 3 simple equations before the CPU clock timer expires to complete the final loop!
                </p>
                <button
                  onClick={startSpeedMath}
                  className="px-8 py-4 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white font-black text-lg rounded-2xl shadow-lg border-b-4 border-orange-700 w-52 hover:scale-105 active:scale-95 transition-transform"
                >
                  START CPU CLOCK
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                {/* Timer progress bar */}
                <div className="w-full max-w-xs bg-slate-200 h-4 rounded-full mb-8 overflow-hidden border border-slate-300">
                  <div 
                    className={`h-full transition-all duration-1000 
                      ${speedMathTimer > 3 ? 'bg-emerald-400' : speedMathTimer > 1 ? 'bg-amber-400' : 'bg-rose-500'}`}
                    style={{ width: `${(speedMathTimer / 6) * 100}%` }}
                  />
                </div>

                <div className="w-40 h-40 bg-slate-900 border-4 border-slate-800 rounded-3xl flex flex-col items-center justify-center text-white mb-8 shadow-lg">
                  <span className="text-[10px] text-rose-400 font-black uppercase tracking-widest mb-2">CLOCK TICK: {speedMathTimer}s</span>
                  <span className="text-4xl font-black">{challenge.q}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-sm">
                  {challenge.options.map((opt: number) => (
                    <button
                      key={opt}
                      onClick={() => submitSpeedMath(opt)}
                      className="py-4 bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 border-4 border-sky-600 text-white rounded-2xl font-black text-xl shadow-md transition-transform hover:scale-105 active:scale-95"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      // PART 3 RENDERERS
      case 'number-patterns': {
        const seq = level.gameData.sequence;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Loop Step Iterator Gate
            </h4>
            <div className="flex items-center gap-4 mb-10">
              {seq.map((n: number | null, i: number) => (
                <div 
                  key={i} 
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border-4 shadow-md transition-all
                    ${n === null 
                      ? 'bg-yellow-50 border-dashed border-yellow-400 text-yellow-500 animate-pulse w-20 h-20' 
                      : 'bg-white border-slate-200 text-slate-800'}`}
                >
                  {n === null ? '?' : n}
                </div>
              ))}
            </div>
            <p className="text-slate-500 font-bold mb-4">Complete the iterator step sequence:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedPatternAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedPatternAnswer !== null}
                    onClick={() => submitNumberPattern(opt)}
                    className={`py-4 rounded-2xl font-black text-xl border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedPatternAnswer === null 
                        ? 'bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-white border-sky-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'shape-patterns': {
        const seq = level.gameData.sequence;
        const renderShapeText = (s: string | null) => {
          if (s === "triangle") return "▲";
          if (s === "circle") return "●";
          if (s === "square") return "■";
          return "?";
        };
        const shapeColors: Record<string, string> = {
          triangle: "text-amber-500 border-amber-200 bg-amber-50",
          circle: "text-sky-500 border-sky-200 bg-sky-50",
          square: "text-pink-500 border-pink-200 bg-pink-50",
        };

        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Nested Matrix Renderer Pattern
            </h4>
            <div className="flex items-center gap-4 mb-10">
              {seq.map((s: string | null, i: number) => (
                <div 
                  key={i} 
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black border-4 shadow-md transition-all
                    ${s === null 
                      ? 'bg-yellow-50 border-dashed border-yellow-400 text-yellow-500 animate-pulse w-20 h-20' 
                      : shapeColors[s]}`}
                >
                  {renderShapeText(s)}
                </div>
              ))}
            </div>
            <p className="text-slate-500 font-bold mb-4">Select the shape to render next in the loop:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-sm">
              {level.gameData.options.map((opt: string) => {
                const isSelected = selectedShapeAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedShapeAnswer !== null}
                    onClick={() => submitShapePattern(opt)}
                    className={`py-4 rounded-2xl font-black text-3xl border-4 transition-all shadow-md transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center
                      ${selectedShapeAnswer === null 
                        ? 'bg-gradient-to-b from-purple-400 to-purple-500 hover:from-purple-300 hover:to-purple-400 text-white border-purple-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {renderShapeText(opt)}
                    <span className="text-[9px] uppercase font-bold tracking-widest mt-1 opacity-70">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'growing-patterns': {
        const seq = level.gameData.sequence;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Recursive Scaling Node
            </h4>
            <div className="flex items-center gap-4 mb-10">
              {seq.map((n: number | null, i: number) => (
                <div 
                  key={i} 
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border-4 shadow-md transition-all
                    ${n === null 
                      ? 'bg-yellow-50 border-dashed border-yellow-400 text-yellow-500 animate-pulse w-20 h-20' 
                      : 'bg-white border-slate-200 text-slate-800'}`}
                >
                  {n === null ? '?' : n}
                </div>
              ))}
            </div>
            <p className="text-slate-500 font-bold mb-4">Complete the growing power-of-two scale:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedGrowingAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedGrowingAnswer !== null}
                    onClick={() => submitGrowingPattern(opt)}
                    className={`py-4 rounded-2xl font-black text-xl border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedGrowingAnswer === null 
                        ? 'bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-white border-sky-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'missing-patterns': {
        const seq = level.gameData.sequence;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Array Offset Index Repair
            </h4>
            <div className="flex items-center gap-4 mb-10">
              {seq.map((n: number | null, i: number) => (
                <div 
                  key={i} 
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border-4 shadow-md transition-all
                    ${n === null 
                      ? 'bg-yellow-50 border-dashed border-yellow-400 text-yellow-500 animate-pulse w-20 h-20' 
                      : 'bg-white border-slate-200 text-slate-800'}`}
                >
                  {n === null ? '?' : n}
                </div>
              ))}
            </div>
            <p className="text-slate-500 font-bold mb-4">Select the missing array patch item:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedMissingAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedMissingAnswer !== null}
                    onClick={() => submitMissingPattern(opt)}
                    className={`py-4 rounded-2xl font-black text-xl border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedMissingAnswer === null 
                        ? 'bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-white border-sky-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'simple-sequences': {
        const raw = level.gameData.options || ["Calculate Formula", "Print Output", "Initialize Variables"];
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              FIFO Pipeline Sequencer
            </h4>
            <p className="text-slate-500 font-medium text-center mb-6 max-w-md text-sm">
              Click the pipeline commands in order of proper program logic.
            </p>
            <div className="flex flex-col gap-4 mb-10 w-full max-w-md">
              {raw.map((cmd: string) => {
                const isAdded = sequenceBlocksSorted.includes(cmd);
                return (
                  <button
                    key={cmd}
                    onClick={() => handleSequenceBlockClick(cmd)}
                    disabled={isAdded}
                    className={`py-3.5 px-6 rounded-2xl flex justify-between items-center border-4 shadow-md font-black text-sm transition-all transform hover:scale-105
                      ${isAdded 
                        ? 'bg-emerald-500 border-emerald-700 text-white opacity-60 scale-95 cursor-not-allowed' 
                        : 'bg-white border-indigo-200 text-indigo-700 hover:border-indigo-400'}`}
                  >
                    {cmd}
                    <span className="text-[10px] text-slate-400 font-bold uppercase">CMD</span>
                  </button>
                );
              })}
            </div>
            <div className="w-full max-w-md bg-slate-900 rounded-2xl p-4 border-2 border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Compiled Pipe</span>
              <div className="flex flex-col gap-2 min-h-[48px]">
                {sequenceBlocksSorted.map((cmd, i) => (
                  <div key={i} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg font-black border border-emerald-500 flex justify-between items-center text-xs">
                    <span>{i+1}. {cmd}</span>
                    <span className="text-[8px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">OK</span>
                  </div>
                ))}
                {sequenceBlocksSorted.length === 0 && (
                  <span className="text-slate-600 font-medium italic flex items-center text-sm">Queue is empty...</span>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'rule-based-patterns': {
        const rule = level.gameData.rule;
        const inputVal = level.gameData.inputVal;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Algebraic Function Machine
            </h4>

            <div className="flex items-center gap-6 mb-8 w-full max-w-md justify-center">
              <div className="w-24 h-24 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex flex-col items-center justify-center shadow-inner">
                <span className="text-[10px] font-black text-slate-400">INPUT X</span>
                <span className="text-3xl font-black text-slate-800">{inputVal}</span>
              </div>
              <div className="w-32 h-32 rounded-3xl bg-slate-900 border-4 border-slate-850 flex flex-col items-center justify-center text-white p-4 relative shadow-lg">
                <span className="text-[9px] text-indigo-400 font-black uppercase mb-1">RULE FUNCTION</span>
                <span className="text-xs font-bold text-center leading-snug">{rule}</span>
              </div>
              <div className="w-24 h-24 rounded-2xl bg-yellow-50 border-2 border-yellow-200 border-dashed flex flex-col items-center justify-center animate-pulse">
                <span className="text-[10px] font-black text-yellow-600">OUTPUT Y</span>
                <span className="text-3xl font-black text-yellow-700">?</span>
              </div>
            </div>

            <p className="text-slate-500 font-bold mb-4">Calculate the output Y:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedRuleAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedRuleAnswer !== null}
                    onClick={() => submitRulePattern(opt)}
                    className={`py-4 rounded-2xl font-black text-xl border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedRuleAnswer === null 
                        ? 'bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-white border-sky-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'matching-sorting': {
        const matches = level.gameData.matches;
        const options = level.gameData.options;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Key-Value Handshake Matcher
            </h4>
            <p className="text-slate-500 font-medium text-center mb-6 max-w-md text-sm">
              Click a key registry block on the left, then select its matching definition value on the right!
            </p>

            <div className="grid grid-cols-2 gap-8 w-full max-w-2xl mb-6">
              {/* Keys Left */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Keys</span>
                {matches.map((m: any) => {
                  const isMatched = matchedPairs[m.key] !== undefined;
                  const isActive = currentlySelectedKey === m.key;
                  return (
                    <button
                      key={m.key}
                      onClick={() => selectMatchingKey(m.key)}
                      disabled={isMatched}
                      className={`py-4 px-6 rounded-2xl border-4 font-black transition-all text-sm text-left flex justify-between items-center shadow-sm
                        ${isMatched 
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-700 opacity-60' 
                          : isActive 
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 scale-102 ring-4 ring-indigo-100' 
                            : 'bg-white border-indigo-100 text-indigo-600 hover:border-indigo-300'}`}
                  >
                    {m.key}
                    {isMatched ? <CheckCircle size={16} className="text-emerald-500" /> : <HelpCircle size={16} className="text-indigo-400" />}
                  </button>
                );
              })}
              </div>

              {/* Values Right */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Values</span>
                {options.map((val: string) => {
                  const isMatched = Object.values(matchedPairs).includes(val);
                  return (
                    <button
                      key={val}
                      onClick={() => selectMatchingVal(val)}
                      disabled={isMatched || !currentlySelectedKey}
                      className={`py-4 px-6 rounded-2xl border-4 font-bold text-xs text-left leading-snug transition-all shadow-sm
                        ${isMatched 
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-700 opacity-60' 
                          : !currentlySelectedKey 
                            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-white border-purple-100 text-purple-600 hover:border-purple-300 hover:scale-102'}`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      case 'classification': {
        const currentItem = level.gameData.items[classificationStep];
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-750 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Type Class Classifier ({classificationStep + 1}/4)
            </h4>

            <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-800 rounded-3xl p-8 text-center text-white mb-8 shadow-lg relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-2 left-3 text-[9px] font-black text-slate-500 tracking-widest uppercase">Target Token</div>
              <div className="w-32 py-4 px-6 bg-gradient-to-r from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center text-white border-2 border-white font-mono font-black text-2xl shadow-md my-4">
                {currentItem.name}
              </div>
              <p className="text-slate-400 text-xs font-bold">Classify the syntax object above:</p>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
              {level.gameData.categories.map((cat: string) => (
                <button
                  key={cat}
                  onClick={() => submitClassification(cat)}
                  className="py-5 bg-gradient-to-b from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 border-4 border-indigo-700 text-white rounded-2xl font-black text-base shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  {cat.toUpperCase()}
                  <span className="block text-[10px] font-bold text-indigo-200 mt-1">Object Subclass</span>
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'boolean-statements': {
        const expression = level.gameData.expression;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-705 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Logical Boolean Gate
            </h4>

            <div className="w-full max-w-md bg-slate-950 border-4 border-slate-850 rounded-3xl p-8 text-center text-white mb-8 shadow-inner relative flex flex-col items-center">
              <div className="absolute top-2 left-3 text-[9px] font-black text-slate-500 tracking-widest uppercase">Expression Evaluator</div>
              <div className="font-mono text-xl font-black text-emerald-400 bg-slate-900 border border-emerald-500/20 px-6 py-4 rounded-2xl shadow-md my-4">
                {expression}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
              <button
                disabled={selectedBooleanAnswer !== null}
                onClick={() => submitBooleanStatement(true)}
                className={`py-5 border-4 rounded-2xl font-black text-xl shadow-md transition-all hover:scale-105 active:scale-95
                  ${selectedBooleanAnswer === null 
                    ? 'bg-gradient-to-b from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-white border-emerald-600' 
                    : selectedBooleanAnswer === true && level.gameData.correctAnswer === true 
                      ? 'bg-emerald-500 text-white border-emerald-700' 
                      : selectedBooleanAnswer === true 
                        ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                        : 'bg-slate-100 text-slate-400 border-slate-200'}`}
              >
                TRUE (1)
              </button>
              <button
                disabled={selectedBooleanAnswer !== null}
                onClick={() => submitBooleanStatement(false)}
                className={`py-5 border-4 rounded-2xl font-black text-xl shadow-md transition-all hover:scale-105 active:scale-95
                  ${selectedBooleanAnswer === null 
                    ? 'bg-gradient-to-b from-rose-400 to-rose-500 hover:from-rose-300 hover:to-rose-400 text-white border-rose-600' 
                    : selectedBooleanAnswer === false && level.gameData.correctAnswer === false 
                      ? 'bg-emerald-500 text-white border-emerald-700' 
                      : selectedBooleanAnswer === false 
                        ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                        : 'bg-slate-100 text-slate-400 border-slate-200'}`}
              >
                FALSE (0)
              </button>
            </div>
          </div>
        );
      }

      case 'conditional-reasoning': {
        const condition = level.gameData.condition;
        const state = level.gameData.state;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-707 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              If-Else Branching Gate
            </h4>

            <div className="w-full max-w-md bg-slate-900 border-4 border-slate-800 rounded-3xl p-6 text-white font-mono text-sm leading-relaxed mb-8 shadow-inner relative flex flex-col gap-4">
              <div className="absolute top-2 left-3 text-[9px] font-black text-slate-500 tracking-widest uppercase">Instruction Cache</div>
              <div className="border-l-4 border-indigo-500 pl-4 mt-2">
                <span className="text-slate-500 block mb-1">State:</span>
                <span className="text-yellow-400 font-bold">{state}</span>
              </div>
              <div className="border-l-4 border-pink-500 pl-4">
                <span className="text-slate-500 block mb-1">Condition Router:</span>
                <span className="text-pink-300 font-bold">{condition}</span>
              </div>
            </div>

            <p className="text-slate-500 font-bold mb-4">Select the evaluated final value of `charge`:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedConditionalAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedConditionalAnswer !== null}
                    onClick={() => submitConditionalReasoning(opt)}
                    className={`py-4 rounded-2xl font-black text-xl border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedConditionalAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-400 to-indigo-500 hover:from-indigo-300 hover:to-indigo-400 text-white border-indigo-600' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      // PART 4 RENDERERS
      case 'basic-shapes': {
        const challenge = level.gameData.properties[shapeStep];
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Vector Shape Rasterizer ({shapeStep + 1}/2)
            </h4>
            <div className="w-36 h-36 bg-slate-900 border-4 border-slate-800 rounded-3xl flex flex-col items-center justify-center text-white mb-8 shadow-lg">
              <span className="text-[10px] text-slate-500 font-black uppercase mb-1">RASTER OBJ</span>
              <span className="text-3xl font-black text-indigo-400">{challenge.shape}</span>
            </div>
            <p className="text-slate-500 font-bold mb-4">Select the matching vector description properties:</p>
            <div className="flex flex-col gap-4 w-full max-w-md">
              {["3 sides, 3 corners", "1 curved side, 0 corners", "4 equal sides, 4 corners"].map((opt: string) => {
                const isSelected = selectedShapePropertyAnswer === opt;
                const isCorrect = opt === challenge.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedShapePropertyAnswer !== null}
                    onClick={() => submitShapeProperty(opt)}
                    className={`py-3.5 px-6 rounded-2xl font-black text-sm border-4 transition-all shadow-md transform hover:scale-102
                      ${selectedShapePropertyAnswer === null 
                        ? 'bg-white border-indigo-100 text-indigo-700 hover:border-indigo-300' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case '2d-3d-shapes': {
        const currentItem = level.gameData.items[shape2d3dStep];
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Depth Projection Classifier ({shape2d3dStep + 1}/4)
            </h4>
            <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-800 rounded-3xl p-8 text-center text-white mb-8 shadow-lg relative flex flex-col items-center">
              <div className="absolute top-2 left-3 text-[9px] font-black text-slate-500 tracking-widest uppercase">Depth Buffer</div>
              <div className="w-32 py-4 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white border-2 border-white font-mono font-black text-2xl shadow-md my-4">
                {currentItem.name}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
              <button
                onClick={() => submit2d3dClassification("2D")}
                className="py-5 bg-gradient-to-b from-sky-400 to-sky-500 border-4 border-sky-600 text-white rounded-2xl font-black text-xl shadow-md hover:scale-105 active:scale-95 transition-transform"
              >
                2D FLAT
                <span className="block text-[10px] text-sky-100 mt-1">X & Y Polygons</span>
              </button>
              <button
                onClick={() => submit2d3dClassification("3D")}
                className="py-5 bg-gradient-to-b from-indigo-500 to-indigo-600 border-4 border-indigo-700 text-white rounded-2xl font-black text-xl shadow-md hover:scale-105 active:scale-95 transition-transform"
              >
                3D DEPTH
                <span className="block text-[10px] text-indigo-100 mt-1">Z-Depth Projection</span>
              </button>
            </div>
          </div>
        );
      }

      case 'symmetry': {
        const leftSide = level.gameData.leftSide;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Mirror Sprite Symmetry
            </h4>
            <p className="text-slate-500 text-sm font-medium mb-6">Complete the symmetrical reflective copy (mirror sign transform scaleX=-1):</p>
            
            <div className="flex gap-4 items-center mb-8 bg-slate-800 p-6 rounded-3xl border-4 border-slate-700 shadow-inner">
              {/* Left Side */}
              <div className="grid grid-cols-2 gap-2">
                {leftSide.map((active: boolean, i: number) => (
                  <div key={i} className={`w-8 h-8 rounded-lg border-2 ${active ? 'bg-indigo-400 border-indigo-300' : 'bg-slate-900 border-slate-850 opacity-40'}`} />
                ))}
              </div>
              <div className="h-16 w-1 bg-yellow-400 border border-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
              {/* Right Mirror Side (interactive or preview) */}
              <div className="grid grid-cols-2 gap-2">
                {selectedSymmetryAnswer ? (
                  selectedSymmetryAnswer.map((active: boolean, i: number) => (
                    <div key={i} className={`w-8 h-8 rounded-lg border-2 ${active ? 'bg-indigo-400 border-indigo-300' : 'bg-slate-900 border-slate-850 opacity-40'}`} />
                  ))
                ) : (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-lg border-2 border-dashed border-slate-650 flex items-center justify-center text-slate-500 font-bold text-xs">?</div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-sm">
              {level.gameData.options.map((opt: boolean[], idx: number) => (
                <button
                  key={idx}
                  onClick={() => submitSymmetry(opt)}
                  className="py-3 px-6 bg-white border-2 border-slate-200 rounded-2xl text-slate-700 font-bold text-sm hover:bg-slate-50 flex items-center justify-between shadow-sm"
                >
                  <span>Reflection Register option {idx + 1}</span>
                  <div className="flex gap-1.5 scale-75">
                    {opt.map((v: boolean, i: number) => (
                      <div key={i} className={`w-4 h-4 rounded-sm ${v ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'position-direction': {
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Vector Heading Aligner
            </h4>
            <div className="w-36 h-36 bg-slate-950 border-4 border-slate-850 rounded-full flex flex-col items-center justify-center text-white mb-8 shadow-inner relative">
              <div className="absolute top-2 text-[9px] font-black tracking-widest text-slate-500">BEARING</div>
              <span className="text-4xl font-black text-yellow-400">90°</span>
              <div className="absolute w-2 h-10 bg-indigo-500 rounded-full origin-bottom -translate-y-5 rotate-90" />
            </div>
            <p className="text-slate-500 font-bold mb-4">Select the heading direction vector matching 90°:</p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => submitPositionDirection(opt)}
                  className="py-4 bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 border-4 border-sky-600 text-white rounded-2xl font-black text-base shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'relative-movement': {
        const target = level.gameData.correctAnswer;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Relative Sprite Translation
            </h4>
            <p className="text-slate-500 font-medium text-xs mb-6 text-center max-w-md">
              Build a translation command pipeline to guide Rover from **start (2, 2)** to target **({target.x}, {target.y})**!
            </p>

            <div className="grid grid-cols-5 gap-1.5 mb-6 bg-slate-900 p-4 rounded-3xl border-4 border-slate-800 shadow-inner">
              {Array.from({ length: 5 }).map((_, y) => (
                <div key={y} className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, x) => {
                    const isRover = relativeMovePosition.x === x && relativeMovePosition.y === y;
                    const isTarget = target.x === x && target.y === y;
                    return (
                      <div 
                        key={x} 
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs border transition-all
                          ${isRover 
                            ? 'bg-yellow-400 border-yellow-300 text-slate-900 shadow-[0_0_10px_rgba(250,204,21,0.8)] scale-102 font-black' 
                            : isTarget 
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-pulse' 
                              : 'bg-slate-950 border-slate-850 opacity-40 text-slate-700'}`}
                      >
                        {isRover ? '🛸' : isTarget ? '🎯' : `${x},${y}`}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="w-full max-w-sm mb-6 flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Command Buffer</span>
              <div className="flex gap-2 min-h-[42px] bg-slate-50 border-2 border-slate-200 rounded-xl p-2">
                {relativeMoveSequence.map((move, i) => (
                  <div key={i} className="px-2.5 py-1 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md font-bold text-xs">
                    {move}
                  </div>
                ))}
                {relativeMoveSequence.length === 0 && (
                  <span className="text-slate-400 font-medium italic text-xs flex items-center">Pipeline is empty...</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-sm">
              <div className="grid grid-cols-4 gap-2">
                {["Up", "Down", "Left", "Right"].map((dir: string) => (
                  <button
                    key={dir}
                    onClick={() => addRelativeMove(dir)}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-xs border border-slate-350 shadow-sm"
                  >
                    +{dir}
                  </button>
                ))}
              </div>
              <button
                onClick={runRelativeMoves}
                disabled={relativeMoveSequence.length === 0}
                className="py-4 bg-gradient-to-r from-emerald-500 to-teal-600 border-4 border-emerald-700 text-white rounded-2xl font-black text-sm shadow-md hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                COMPILE & EXECUTE TRANSLATIONS
              </button>
            </div>
          </div>
        );
      }

      case 'turns-clockwise': {
        const turn = level.gameData.turn;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Rotational Transform Gate
            </h4>
            <div className="w-36 h-36 bg-slate-900 border-4 border-slate-800 rounded-3xl flex flex-col items-center justify-center text-white mb-8 shadow-lg relative">
              <div className="absolute top-2 text-[9px] font-black tracking-widest text-slate-500">TRANSFORM</div>
              <span className="text-2xl font-black text-indigo-400">{turn}</span>
            </div>
            <p className="text-slate-500 font-bold mb-4">Select the final output angle:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: number) => (
                <button
                  key={opt}
                  onClick={() => submitTurnAngle(opt)}
                  className="py-4 bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 border-4 border-sky-600 text-white rounded-2xl font-black text-xl shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  {opt}°
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'angles-basics': {
        const angle = level.gameData.angle;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Trigonometric Angle Classifier
            </h4>
            <div className="w-36 h-36 bg-slate-950 border-4 border-slate-850 rounded-full flex flex-col items-center justify-center text-white mb-8 shadow-inner relative">
              <span className="text-4xl font-black text-yellow-400">{angle}°</span>
              <div className="absolute w-2 h-10 bg-indigo-500 rounded-full origin-bottom -translate-y-5" />
              <div className="absolute w-2 h-10 bg-pink-500 rounded-full origin-bottom -translate-y-5 rotate-90" />
            </div>
            <p className="text-slate-500 font-bold mb-4">Classify the angle type:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => submitAngleType(opt)}
                  className="py-3 px-4 bg-gradient-to-b from-purple-400 to-purple-500 hover:from-purple-300 hover:to-purple-400 border-4 border-purple-600 text-white rounded-2xl font-black text-xs shadow-md transition-transform hover:scale-102 active:scale-98 flex items-center justify-center"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'grid-movement': {
        const targetR = level.gameData.targetRow;
        const targetC = level.gameData.targetCol;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              2D Grid Array Index Scan
            </h4>
            <p className="text-slate-500 font-medium text-xs mb-6 text-center max-w-sm">
              Click the coordinate option matching target node: **Row {targetR}, Column {targetC}**.
            </p>

            <div className="flex flex-col gap-1.5 mb-8 bg-slate-900 p-4 rounded-3xl border-4 border-slate-800 shadow-inner">
              {Array.from({ length: 4 }).map((_, r) => (
                <div key={r} className="flex gap-1.5">
                  {Array.from({ length: 4 }).map((_, c) => {
                    const isTarget = targetR === r && targetC === c;
                    return (
                      <div 
                        key={c} 
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs border transition-all
                          ${isTarget 
                            ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_10px_rgba(99,102,241,0.8)] scale-105 animate-pulse' 
                            : 'bg-slate-950 border-slate-850 opacity-40 text-slate-700'}`}
                      >
                        {r},{c}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => submitGridSelection(opt)}
                  className="py-3 px-4 bg-gradient-to-b from-sky-400 to-sky-500 border-4 border-sky-600 text-white rounded-2xl font-black text-xs shadow-md transition-transform hover:scale-102 active:scale-98 flex items-center justify-center"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'cartesian-coordinates': {
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Cartesian Map Plotter
            </h4>
            <p className="text-slate-500 font-medium text-xs mb-6 text-center max-w-sm">
              Read the X (horizontal) and Y (vertical) coordinate address of the glowing node.
            </p>

            <div className="w-48 h-48 bg-slate-900 border-4 border-slate-800 rounded-3xl mb-8 relative flex items-center justify-center shadow-inner">
              {/* Cartesian Axes */}
              <div className="absolute w-full h-0.5 bg-slate-700" />
              <div className="absolute h-full w-0.5 bg-slate-700" />
              {/* Target Dot */}
              <div className="absolute w-4 h-4 bg-emerald-450 rounded-full border-2 border-white shadow-[0_0_12px_rgba(52,211,153,0.9)] translate-x-12 -translate-y-16" />
              <div className="absolute top-2 left-2 text-[9px] text-slate-500 font-black">QUADRANT I</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => submitCartesianCoordinate(opt)}
                  className="py-3 px-4 bg-gradient-to-b from-sky-400 to-sky-500 border-4 border-sky-600 text-white rounded-2xl font-black text-sm shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'maps-routes': {
        const raw = level.gameData.options;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Shortest Path Pathfinding Routing
            </h4>
            <p className="text-slate-500 font-medium text-xs mb-6 text-center max-w-sm">
              Verify the routing node sequence in order: **Start &rarr; Node A &rarr; Server Hub**.
            </p>
            <div className="flex flex-wrap gap-4 mb-8 justify-center max-w-sm">
              {raw.map((node: string) => {
                const isAdded = selectedMapRoute.includes(node);
                return (
                  <button
                    key={node}
                    onClick={() => handleMapNodeClick(node)}
                    disabled={isAdded}
                    className={`px-6 py-3.5 border-4 rounded-2xl font-black text-sm transition-all transform hover:scale-105
                      ${isAdded 
                        ? 'bg-emerald-500 border-emerald-700 text-white opacity-60 scale-95 cursor-not-allowed' 
                        : 'bg-white border-indigo-200 text-indigo-700 hover:border-indigo-400'}`}
                  >
                    {node}
                  </button>
                );
              })}
            </div>

            <div className="w-full max-w-md bg-slate-900 rounded-2xl p-4 border-2 border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Selected Path Route</span>
              <div className="flex items-center gap-2 min-h-[42px]">
                {selectedMapRoute.map((node, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-slate-600 font-black">&rarr;</span>}
                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg font-black border border-emerald-500 text-xs">
                      {node}
                    </div>
                  </div>
                ))}
                {selectedMapRoute.length === 0 && (
                  <span className="text-slate-600 font-medium italic flex items-center text-sm">No routing nodes selected...</span>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'measure-length': {
        const lineLength = level.gameData.lineLength;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Sensor Length Unit
            </h4>
            <div className="w-full max-w-md bg-white p-6 border-4 border-slate-200 rounded-3xl shadow-inner mb-8 flex flex-col items-center">
              <div className="w-full flex items-center justify-start h-8 bg-slate-50 border border-slate-200 rounded-lg relative overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-r-md transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                  style={{ width: `${(lineLength / 12) * 100}%` }}
                />
              </div>
              <svg className="w-full h-8" viewBox="0 0 100 20">
                <line x1="0" y1="0" x2="100" y2="0" stroke="#94a3b8" strokeWidth="2" />
                {Array.from({ length: 13 }).map((_, i) => {
                  const x = (i / 12) * 100;
                  const isMajor = i % 2 === 0;
                  return (
                    <g key={i}>
                      <line x1={x} y1="0" x2={x} y2={isMajor ? 10 : 6} stroke="#64748b" strokeWidth={isMajor ? "1.5" : "1"} />
                      {isMajor && <text x={x} y="18" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#64748b">{i}</text>}
                    </g>
                  );
                })}
              </svg>
            </div>
            <p className="text-slate-500 font-bold mb-4">Select the line length (cm):</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: number) => (
                <button
                  key={opt}
                  onClick={() => submitLength(opt)}
                  className="py-4 bg-gradient-to-b from-indigo-500 to-indigo-600 border-4 border-indigo-700 text-white rounded-2xl font-black text-xl shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  {opt} cm
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'measure-height': {
        const heights = level.gameData.heights;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Depth & Height Scanner
            </h4>
            <div className="flex gap-8 items-end justify-center mb-8 h-36 w-full max-w-md border-b-4 border-slate-200 pb-2">
              {Object.entries(heights).map(([label, hVal]) => {
                const heightPercent = ((hVal as number) / 20) * 100;
                return (
                  <div key={label} className="flex flex-col items-center gap-2 w-16">
                    <div 
                      className="w-full bg-gradient-to-t from-pink-500 to-rose-450 rounded-t-xl shadow-md flex items-end justify-center text-white font-black text-xs pb-2 transition-all"
                      style={{ height: `${heightPercent}%` }}
                    >
                      {hVal as number}
                    </div>
                    <span className="font-bold text-slate-600 text-sm">Tower {label}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-slate-700 font-bold mb-4 text-center">{level.gameData.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => submitHeight(opt)}
                  className="py-3 px-6 bg-gradient-to-b from-pink-500 to-pink-650 border-4 border-pink-700 text-white rounded-2xl font-black text-lg shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  Tower {opt}
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'measure-weight': {
        const leftWeight = level.gameData.leftWeight;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Payload Weight Balancer
            </h4>
            <p className="text-slate-500 font-medium text-xs mb-6 text-center max-w-sm">
              Add the correct payload weight block to equal the left scale ({leftWeight}kg).
            </p>
            <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-800 p-6 rounded-3xl shadow-inner mb-8 flex justify-between items-end relative h-32">
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-2 bg-slate-600 rounded-full" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-slate-500 rounded-t-lg" />
              <div className="flex flex-col items-center gap-1 w-24 relative z-10 -translate-y-4">
                <div className="px-4 py-3 bg-gradient-to-b from-amber-400 to-amber-500 text-slate-900 font-black rounded-xl text-center shadow-md">
                  {leftWeight} kg
                </div>
                <div className="h-1 w-16 bg-slate-500" />
              </div>
              <div className="flex flex-col items-center gap-1 w-24 relative z-10 -translate-y-4">
                <div className="px-4 py-3 bg-slate-800 border-2 border-dashed border-slate-600 text-slate-500 font-black rounded-xl text-center">
                  ? kg
                </div>
                <div className="h-1 w-16 bg-slate-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => (
                <button
                  key={opt}
                  onClick={() => submitWeight(opt)}
                  className="py-4 bg-gradient-to-b from-amber-400 to-amber-500 border-4 border-amber-600 text-slate-900 rounded-2xl font-black text-lg shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  {opt} kg
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'measure-time': {
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Execution Clock Ticker
            </h4>
            <div className="w-32 h-32 rounded-full border-4 border-slate-800 bg-white relative flex items-center justify-center shadow-md mb-8">
              <div className="absolute top-1 text-slate-700 font-black text-xs">12</div>
              <div className="absolute bottom-1 text-slate-700 font-black text-xs">6</div>
              <div className="absolute right-1.5 text-slate-700 font-black text-xs">3</div>
              <div className="absolute left-1.5 text-slate-700 font-black text-xs">9</div>
              <div className="absolute w-1 h-10 bg-slate-800 rounded-full origin-bottom -translate-y-5" />
              <div className="absolute h-1 w-8 bg-slate-800 rounded-full origin-left translate-x-4" />
              <div className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm" />
            </div>
            <p className="text-slate-550 font-bold mb-4">Identify the scheduled execution time:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md">
              {level.gameData.options.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => submitTime(opt)}
                  className="py-3 px-4 bg-gradient-to-b from-indigo-500 to-indigo-655 border-4 border-indigo-700 text-white rounded-2xl font-black text-lg shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'measure-calendar': {
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Cron Scheduler Calendar
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm">
              {level.gameData.question}
            </p>
            <div className="grid grid-cols-7 gap-1.5 p-4 bg-slate-900 border-4 border-slate-800 rounded-3xl shadow-inner mb-6 w-full max-w-sm">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div key={i} className="text-slate-500 text-[10px] font-black text-center mb-1">{d}</div>
              ))}
              {Array.from({ length: 14 }).map((_, i) => {
                const dayName = i === 0 ? "Monday" : i === 2 ? "Wednesday" : i === 4 ? "Friday" : i === 6 ? "Sunday" : "";
                const isHighlight = dayName !== "";
                return (
                  <div 
                    key={i} 
                    className={`h-8 rounded-lg flex items-center justify-center font-black text-xs border
                      ${isHighlight 
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                        : 'bg-slate-950 border-slate-850 opacity-40 text-slate-700'}`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => submitCalendar(opt)}
                  className="py-3.5 bg-gradient-to-b from-sky-400 to-sky-500 border-4 border-sky-600 text-white rounded-2xl font-black text-sm shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'speed-basics': {
        const dist = level.gameData.distance;
        const time = level.gameData.time;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Animation Speed Basics
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm">
              Calculate speed required to travel **{dist} meters** in **{time} seconds**: <br/>
              <span className="font-bold text-slate-700">Speed = Distance / Time</span>
            </p>
            <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-850 rounded-3xl p-4 mb-8 relative flex items-center justify-start overflow-hidden h-16 shadow-inner animate-pulse">
              <div className="absolute left-4 animate-pulse flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-transparent rounded-full" />
              </div>
              <div className="absolute right-4 text-xs font-bold text-slate-550">GATE</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => (
                <button
                  key={opt}
                  onClick={() => submitSpeed(opt)}
                  className="py-4 bg-gradient-to-b from-indigo-500 to-indigo-600 border-4 border-indigo-700 text-white rounded-2xl font-black text-lg shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  {opt} m/s
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'measure-distance': {
        const pts = level.gameData.points;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Robotics Distance Sensor
            </h4>
            <div className="w-full max-w-md bg-white p-6 border-4 border-slate-200 rounded-3xl shadow-inner mb-8 flex flex-col items-center justify-center">
              <svg className="w-full h-12" viewBox="0 0 100 30">
                <line x1="10" y1="10" x2="90" y2="10" stroke="#94a3b8" strokeWidth="2.5" />
                {Array.from({ length: 11 }).map((_, i) => {
                  const x = 10 + (i / 10) * 80;
                  const isA = i === pts.A;
                  const isB = i === pts.B;
                  return (
                    <g key={i}>
                      <line x1={x} y1="7" x2={x} y2="13" stroke="#64748b" strokeWidth="2" />
                      <text x={x} y="24" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#64748b">{i}</text>
                      {isA && (
                        <circle cx={x} cy="10" r="3.5" fill="#f59e0b" stroke="white" strokeWidth="1" />
                      )}
                      {isB && (
                        <circle cx={x} cy="10" r="3.5" fill="#ef4444" stroke="white" strokeWidth="1" />
                      )}
                    </g>
                  );
                })}
              </svg>
              <div className="flex gap-4 mt-2 text-xs font-black">
                <span className="text-amber-500">Point A (Sensor) = {pts.A}</span>
                <span className="text-red-500">Point B (Wall) = {pts.B}</span>
              </div>
            </div>
            <p className="text-slate-500 font-bold mb-4">What is the distance between Point A and B?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => (
                <button
                  key={opt}
                  onClick={() => submitDistance(opt)}
                  className="py-4 bg-gradient-to-b from-indigo-500 to-indigo-600 border-4 border-indigo-700 text-white rounded-2xl font-black text-xl shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  {opt} units
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'measure-temperature': {
        const val = level.gameData.temperatureVal;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full">
            <h4 className="text-xl font-bold text-slate-700 mb-6 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Core Temperature Regulating
            </h4>
            <div className="w-16 h-36 bg-slate-900 border-4 border-slate-800 rounded-full relative p-2 shadow-inner mb-6 flex flex-col items-center justify-end">
              <div 
                className="w-full bg-gradient-to-t from-red-500 to-rose-400 rounded-full transition-all"
                style={{ height: `${(val / 120) * 100}%` }}
              />
              <div className="absolute top-2 text-[9px] font-black text-slate-500 uppercase">TEMP</div>
            </div>
            <p className="text-slate-500 font-bold mb-4">Read the CPU thermostat thermometer (°C):</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => (
                <button
                  key={opt}
                  onClick={() => submitTemperature(opt)}
                  className="py-4 bg-gradient-to-b from-rose-500 to-rose-600 border-4 border-rose-700 text-white rounded-2xl font-black text-lg shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  {opt}°C
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'measure-area': {
        const w = level.gameData.width;
        const h = level.gameData.height;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Buffer Grid Area Block
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm">
              Count the total shaded square blocks inside the active allocation region ({w}x{h}).
            </p>
            <div className="grid grid-cols-5 gap-1 p-2 bg-slate-900 border-4 border-slate-800 rounded-2xl shadow-inner mb-8">
              {Array.from({ length: 4 }).map((_, r) => (
                <div key={r} className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, c) => (
                    <div key={c} className="w-8 h-8 rounded bg-indigo-500 border border-indigo-400 opacity-80 shadow-sm shadow-indigo-200" />
                  ))}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => (
                <button
                  key={opt}
                  onClick={() => submitArea(opt)}
                  className="py-4 bg-gradient-to-b from-indigo-500 to-indigo-600 border-4 border-indigo-700 text-white rounded-2xl font-black text-lg shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  {opt} units²
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'measure-perimeter': {
        const w = level.gameData.width;
        const h = level.gameData.height;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Perimeter Collision Boundary
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm">
              Calculate perimeter firewall line length for a width of **{w}** and height of **{h}**.
            </p>
            <div className="w-40 h-28 border-4 border-dashed border-rose-500 bg-rose-500/10 rounded-2xl mb-8 flex flex-col justify-between p-3 relative shadow-inner">
              <span className="absolute top-1/2 left-2 -translate-y-1/2 text-xs font-black text-rose-600">{h} units</span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-black text-rose-600">{w} units</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => (
                <button
                  key={opt}
                  onClick={() => submitPerimeter(opt)}
                  className="py-4 bg-gradient-to-b from-rose-500 to-rose-600 border-4 border-rose-700 text-white rounded-2xl font-black text-lg shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  {opt} units
                </button>
              ))}
            </div>
          </div>
        );
      }

      // PART 6: Fractions, Decimals, and Percentages
      case 'fraction-whole': {
        const total = level.gameData.total;
        const active = level.gameData.active;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Sector Memory Allocation
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm">
              What fraction of the total memory sector grid is currently active?
            </p>
            <div className="flex gap-1.5 p-3 bg-slate-900 border-4 border-slate-800 rounded-2xl shadow-inner mb-8 w-full max-w-sm">
              {Array.from({ length: total }).map((_, i) => (
                <div 
                  key={i} 
                  className={`h-12 flex-1 rounded transition-all duration-300 border-2
                    ${i < active 
                      ? 'bg-gradient-to-br from-cyan-450 to-indigo-500 border-cyan-350 shadow-[0_0_12px_rgba(6,182,212,0.8)]' 
                      : 'bg-slate-800 border-slate-700 opacity-20'}`}
                />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: string) => {
                const isSelected = selectedFractionWholeAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedFractionWholeAnswer !== null}
                    onClick={() => submitFractionWhole(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedFractionWholeAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'fraction-equivalence': {
        const base = level.gameData.baseFraction;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Equivalent Memory Size
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm">
              Find the fraction that is equivalent to <span className="font-bold text-indigo-600 text-base">{base}</span>.
            </p>
            <div className="text-5xl font-black text-indigo-600 bg-indigo-50 border-4 border-indigo-100 px-8 py-5 rounded-[2rem] shadow-inner mb-8 rotate-1">
              {base}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: string) => {
                const isSelected = selectedFractionEquivalenceAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedFractionEquivalenceAnswer !== null}
                    onClick={() => submitFractionEquivalence(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedFractionEquivalenceAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'fraction-comparison': {
        const f1 = level.gameData.fraction1;
        const f2 = level.gameData.fraction2;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Memory Load Comparison
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm">
              Compare the two sectors: which statement is correct?
            </p>
            <div className="flex gap-8 justify-center items-center mb-8 w-full max-w-sm">
              <div className="flex flex-col items-center gap-2">
                <span className="font-bold text-sm text-slate-500">Sector A</span>
                <span className="text-2xl font-black text-slate-800 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">{f1}</span>
              </div>
              <div className="text-2xl font-bold text-slate-400">vs</div>
              <div className="flex flex-col items-center gap-2">
                <span className="font-bold text-sm text-slate-500">Sector B</span>
                <span className="text-2xl font-black text-slate-800 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">{f2}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: string) => {
                const isSelected = selectedFractionComparisonAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedFractionComparisonAnswer !== null}
                    onClick={() => submitFractionComparison(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedFractionComparisonAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'fraction-addition': {
        const sum = level.gameData.sum;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Sector Sum Addition
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm">
              Add the two memory sectors together:
            </p>
            <div className="text-4xl font-black text-indigo-600 bg-indigo-50 border-4 border-indigo-100 px-8 py-5 rounded-[2rem] shadow-inner mb-8 rotate-1">
              {sum}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: string) => {
                const isSelected = selectedFractionAdditionAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedFractionAdditionAnswer !== null}
                    onClick={() => submitFractionAddition(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedFractionAdditionAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'decimal-basics': {
        const fraction = level.gameData.fraction;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Decimal Register Conversion
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm">
              Convert the sector size fraction into its decimal representation:
            </p>
            <div className="text-4xl font-black text-sky-600 bg-sky-50 border-4 border-sky-100 px-8 py-5 rounded-[2rem] shadow-inner mb-8 rotate-[-1deg]">
              {fraction}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedDecimalBasicsAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedDecimalBasicsAnswer !== null}
                    onClick={() => submitDecimalBasics(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedDecimalBasicsAnswer === null 
                        ? 'bg-gradient-to-b from-sky-400 to-sky-500 border-sky-600 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt.toFixed(2)}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'decimal-money': {
        const items = level.gameData.items;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Server Upgrades Store
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm">
              Calculate total cost for the following hardware upgrades:
            </p>
            <div className="bg-slate-900 border-4 border-slate-800 rounded-3xl p-5 mb-8 w-full max-w-sm text-slate-300 font-mono shadow-inner">
              {items.map((item: { name: string, price: number }, idx: number) => (
                <div key={idx} className="flex justify-between border-b border-slate-850 py-2">
                  <span>{item.name}</span>
                  <span className="font-bold text-emerald-400">${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedDecimalMoneyAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedDecimalMoneyAnswer !== null}
                    onClick={() => submitDecimalMoney(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedDecimalMoneyAnswer === null 
                        ? 'bg-gradient-to-b from-sky-400 to-sky-500 border-sky-600 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    ${opt.toFixed(2)}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'percentage-basics': {
        const fraction = level.gameData.fraction;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Percentage Resource Level
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm">
              What percentage does the fraction <span className="font-bold text-indigo-600">{fraction}</span> correspond to?
            </p>
            <div className="text-4xl font-black text-indigo-600 bg-indigo-50 border-4 border-indigo-100 px-8 py-5 rounded-[2rem] shadow-inner mb-8 rotate-1">
              {fraction}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedPercentageBasicsAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedPercentageBasicsAnswer !== null}
                    onClick={() => submitPercentageBasics(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedPercentageBasicsAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}%
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'percentage-discount': {
        const original = level.gameData.originalPrice;
        const discount = level.gameData.discountPercent;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              License Purchase Discounts
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm leading-relaxed">
              A software license is originally <span className="font-bold text-slate-700">${original}</span>. <br/>
              Apply a coupon code discount of <span className="font-bold text-emerald-600">{discount}%</span>:
            </p>
            <div className="w-32 h-32 bg-gradient-to-br from-amber-300 to-yellow-400 border-4 border-white shadow-xl rounded-[2.5rem] flex flex-col items-center justify-center text-center rotate-[-3deg] mb-8 relative">
              <span className="text-[10px] font-black tracking-widest text-yellow-800 uppercase">OFFER</span>
              <span className="text-3xl font-black text-yellow-900">-{discount}%</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedPercentageDiscountAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedPercentageDiscountAnswer !== null}
                    onClick={() => submitPercentageDiscount(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedPercentageDiscountAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    ${opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'ratio-basics': {
        const itemA = level.gameData.itemA;
        const itemB = level.gameData.itemB;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Active Ratio Scanner
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm">
              Write down the simplified ratio of green components to purple components:
            </p>
            <div className="grid grid-cols-5 gap-3 p-4 bg-slate-900 border-4 border-slate-800 rounded-3xl mb-8 w-full max-w-sm shadow-inner justify-items-center">
              {Array.from({ length: itemA }).map((_, i) => (
                <div key={`a-${i}`} className="w-8 h-8 rounded-lg bg-emerald-400 border-2 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              ))}
              {Array.from({ length: itemB }).map((_, i) => (
                <div key={`b-${i}`} className="w-8 h-8 rounded-lg bg-purple-500 border-2 border-purple-450 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: string) => {
                const isSelected = selectedRatioBasicsAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedRatioBasicsAnswer !== null}
                    onClick={() => submitRatioBasics(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedRatioBasicsAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'proportion-basics': {
        const text = level.gameData.text;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Resource Scale Proportion
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm leading-relaxed">
              {text}
            </p>
            <div className="text-5xl mb-8">⚖️</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedProportionBasicsAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedProportionBasicsAnswer !== null}
                    onClick={() => submitProportionBasics(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedProportionBasicsAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      // PART 7: Data and Statistics
      case 'data-collecting': {
        const list = level.gameData.items;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Data Logger Scanner
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm">
              Count the logs and input their tally values below:
            </p>
            <div className="bg-slate-900 border-4 border-slate-800 rounded-3xl p-4 mb-6 w-full max-w-sm flex flex-wrap gap-2 justify-center shadow-inner h-28 overflow-y-auto">
              {list.map((item: string, idx: number) => {
                const color = item === 'Server Logs' ? 'text-amber-400 bg-amber-400/10 border-amber-450/20' : item === 'Database' ? 'text-indigo-400 bg-indigo-400/10 border-indigo-450/20' : 'text-emerald-400 bg-emerald-400/10 border-emerald-450/20';
                return (
                  <span key={idx} className={`px-3 py-1.5 rounded-xl font-semibold border text-xs font-mono ${color}`}>{item}</span>
                );
              })}
            </div>
            <div className="flex gap-4 w-full max-w-sm justify-between">
              {([
                { name: 'Server Logs', key: 'A', color: 'amber' },
                { name: 'Database', key: 'B', color: 'indigo' },
                { name: 'API Request', key: 'C', color: 'emerald' }
              ] as const).map(({ name, key }) => {
                const curVal = selectedDataCollectingAnswer[key] || 0;
                return (
                  <div key={key} className="flex-1 bg-white p-3 border border-slate-200 rounded-2xl flex flex-col items-center shadow-sm">
                    <span className="font-bold text-[10px] text-slate-500 mb-2 truncate max-w-full">{name}</span>
                    <span className="text-2xl font-black text-slate-700 mb-3">{curVal}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => submitDataCollecting(key, Math.max(0, curVal - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-205 hover:bg-slate-200"
                      >
                        -
                      </button>
                      <button
                        onClick={() => submitDataCollecting(key, curVal + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-205 hover:bg-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'data-tables': {
        const rows = level.gameData.table;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Ping Latency Table
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm">
              Which server region has the lowest ping latency?
            </p>
            <div className="w-full max-w-md bg-white border-4 border-slate-200 rounded-3xl overflow-hidden shadow-inner mb-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-200 text-[10px] font-black text-slate-600 uppercase">
                    <th className="px-6 py-3">Server Location</th>
                    <th className="px-6 py-3">Ping Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: { location: string, ping: number }, idx: number) => (
                    <tr key={idx} className="border-b border-slate-100 text-sm font-semibold text-slate-700">
                      <td className="px-6 py-3">{row.location}</td>
                      <td className="px-6 py-3 font-mono text-indigo-600">{row.ping} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: string) => {
                const isSelected = selectedDataTablesAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedDataTablesAnswer !== null}
                    onClick={() => submitDataTables(opt)}
                    className={`py-3 px-1.5 rounded-2xl font-black text-sm border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedDataTablesAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'data-pictograms': {
        const keyVal = level.gameData.key;
        const categories = level.gameData.categories;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Pictogram File Count
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-4 text-center max-w-sm animate-pulse">
              How many files does category **Server Logs** represent?
            </p>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl px-4 py-2 text-amber-800 text-xs font-black mb-6">
              Key: ⭐ = {keyVal} Files
            </div>
            <div className="bg-slate-900 border-4 border-slate-800 rounded-3xl p-5 mb-8 w-full max-w-sm text-slate-300 shadow-inner flex flex-col gap-3">
              {categories.map((c: { name: string, stars: number }, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="font-bold text-xs">{c.name}:</span>
                  <div className="flex gap-1 text-base text-yellow-400 font-sans">
                    {Array.from({ length: c.stars }).map((_, i) => <span key={i}>⭐</span>)}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedDataPictogramsAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedDataPictogramsAnswer !== null}
                    onClick={() => submitDataPictograms(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedDataPictogramsAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'data-bar-charts': {
        const categories = level.gameData.categories;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Latency Bar Chart
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm">
              Which category registered the highest resource overhead?
            </p>
            <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-800 rounded-3xl p-6 h-40 flex items-end gap-6 justify-center mb-8 shadow-inner">
              {categories.map((c: { name: string, value: number }, idx: number) => {
                const percent = (c.value / 100) * 100;
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end">
                    <span className="text-[10px] font-black text-indigo-400 mb-1">{c.value}</span>
                    <div 
                      className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all duration-500 shadow-lg shadow-indigo-500/20"
                      style={{ height: `${percent}%` }}
                    />
                    <span className="text-[9px] font-bold text-slate-400 mt-2 truncate max-w-full">{c.name}</span>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: string) => {
                const isSelected = selectedDataBarChartsAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedDataBarChartsAnswer !== null}
                    onClick={() => submitDataBarCharts(opt)}
                    className={`py-3 px-1 rounded-2xl font-black text-xs border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedDataBarChartsAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'data-line-graphs': {
        const points = level.gameData.points;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Core Temperature Trend
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm animate-pulse">
              Follow the trend coordinates: what is the temperature value at step **2**?
            </p>
            <div className="w-full max-w-sm bg-white p-4 border-4 border-slate-200 rounded-3xl shadow-inner mb-8 flex items-center justify-center">
              <svg className="w-full h-32" viewBox="0 0 100 40">
                <path 
                  d={`M 10,${40 - points[0]} L 30,${40 - points[1]} L 50,${40 - points[2]} L 70,${40 - points[3]} L 90,${40 - points[4]}`} 
                  fill="none" 
                  stroke="#6366f1" 
                  strokeWidth="2" 
                />
                {points.map((p: number, i: number) => {
                  const x = 10 + i * 20;
                  const y = 40 - p;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="2.5" fill="#f43f5e" stroke="white" strokeWidth="0.8" />
                      <text x={x} y={y - 4} textAnchor="middle" fontSize="4.5" fontWeight="black" fill="#475569">{p}°C</text>
                      <text x={x} y="38" textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="#94a3b8">S{i}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedDataLineGraphsAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedDataLineGraphsAnswer !== null}
                    onClick={() => submitDataLineGraphs(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedDataLineGraphsAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}°C
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'data-pie-charts': {
        const sectors = level.gameData.sectors;
        let lastPercent = 0;
        const gradientString = sectors.map((s: { name: string, value: number, color: string }) => {
          const start = lastPercent;
          lastPercent += s.value;
          return `${s.color} ${start}% ${lastPercent}%`;
        }).join(', ');

        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Memory Segment Allocation
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm">
              Which database segment holds the largest share of memory?
            </p>
            <div className="flex gap-8 items-center mb-8">
              <div 
                className="w-32 h-32 rounded-full border-4 border-white shadow-xl"
                style={{ background: `conic-gradient(${gradientString})` }}
              />
              <div className="flex flex-col gap-2">
                {sectors.map((s: { name: string, value: number, color: string }, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: s.color }} />
                    <span className="text-xs font-bold text-slate-600">{s.name} ({s.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: string) => {
                const isSelected = selectedDataPieChartsAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedDataPieChartsAnswer !== null}
                    onClick={() => submitDataPieCharts(opt)}
                    className={`py-3 px-1 rounded-2xl font-black text-xs border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedDataPieChartsAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'data-mean': {
        const values = level.gameData.values;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Calculate Average Mean
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm leading-relaxed">
              Find the mean average value of the following storage capacity logs: <br/>
              <span className="font-bold text-slate-605">Mean = Sum / Total Count</span>
            </p>
            <div className="flex gap-3 mb-8">
              {values.map((v: number, idx: number) => (
                <span key={idx} className="bg-indigo-50 border-2 border-indigo-100 text-indigo-600 px-5 py-3 rounded-2xl text-2xl font-black shadow-inner">{v}</span>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedDataMeanAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedDataMeanAnswer !== null}
                    onClick={() => submitDataMean(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedDataMeanAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'data-median': {
        const values = level.gameData.values;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Calculate Sorted Median
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm leading-relaxed animate-pulse">
              Find the middle value (median) of these sorted CPU loading percentages:
            </p>
            <div className="flex gap-2.5 mb-8">
              {values.map((v: number, idx: number) => (
                <span key={idx} className="bg-indigo-50 border-2 border-indigo-100 text-indigo-600 px-4 py-2.5 rounded-2xl text-xl font-black shadow-inner">{v}</span>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedDataMedianAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedDataMedianAnswer !== null}
                    onClick={() => submitDataMedian(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedDataMedianAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'data-mode': {
        const values = level.gameData.values;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Calculate Tally Mode
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm leading-relaxed">
              Find the most frequent number (mode) among these database transaction IDs:
            </p>
            <div className="flex flex-wrap gap-2.5 mb-8 justify-center max-w-sm">
              {values.map((v: number, idx: number) => (
                <span key={idx} className="bg-indigo-50 border-2 border-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-lg font-black shadow-inner">{v}</span>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedDataModeAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedDataModeAnswer !== null}
                    onClick={() => submitDataMode(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedDataModeAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'data-interpretation': {
        const values = level.gameData.values;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Register Range Difference
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm leading-relaxed animate-pulse">
              Find the range (maximum value - minimum value) of the storage nodes:
            </p>
            <div className="flex gap-3 mb-8">
              {values.map((v: number, idx: number) => (
                <span key={idx} className="bg-indigo-50 border-2 border-indigo-100 text-indigo-600 px-5 py-3 rounded-2xl text-xl font-black shadow-inner">{v}</span>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedDataInterpretationAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedDataInterpretationAnswer !== null}
                    onClick={() => submitDataInterpretation(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedDataInterpretationAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      // PART 8: Problem Solving and Algorithmic Thinking
      case 'algo-steps': {
        const steps = level.gameData.steps;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Compiler Sequence Ordering
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm leading-relaxed">
              Click the commands to sequence them in the correct boot order:
            </p>
            <div className="w-full max-w-md bg-slate-900 border-4 border-slate-800 rounded-3xl p-4 mb-6 shadow-inner min-h-[5rem] flex flex-col gap-2 justify-center">
              {selectedAlgoStepsAnswer.length === 0 ? (
                <span className="text-slate-600 font-mono text-center text-xs italic">Command register is empty...</span>
              ) : (
                selectedAlgoStepsAnswer.map((step: string, idx: number) => (
                  <div key={idx} className="bg-indigo-600 border border-indigo-400 text-white px-4 py-1.5 rounded-xl font-mono text-xs flex justify-between items-center shadow">
                    <span>{idx + 1}. {step}</span>
                    <button 
                      onClick={() => toggleAlgoStepSelection(step)}
                      className="text-indigo-200 hover:text-white font-bold text-sm px-1.5"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex flex-col gap-2 w-full max-w-md mb-6">
              {steps.map((step: string, idx: number) => {
                const isSelected = selectedAlgoStepsAnswer.includes(step);
                return (
                  <button
                    key={idx}
                    disabled={isSelected}
                    onClick={() => toggleAlgoStepSelection(step)}
                    className={`py-3 px-4 border-2 rounded-2xl font-bold text-xs font-mono text-left transition-all shadow-sm
                      ${isSelected 
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50' 
                        : 'bg-white border-indigo-100 hover:border-indigo-300 text-indigo-700'}`}
                  >
                    {step}
                  </button>
                );
              })}
            </div>
            <button
              onClick={submitAlgoSteps}
              disabled={selectedAlgoStepsAnswer.length < steps.length}
              className="py-3.5 px-8 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 border-4 border-emerald-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Execute Sequence
            </button>
          </div>
        );
      }

      case 'algo-decomposition': {
        const tasks = level.gameData.subTasks;
        const expected = level.gameData.correctAnswer;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Server Task Decomposition
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm leading-relaxed">
              Decompose the main program: select the **{expected.length} sub-tasks** required:
            </p>
            <div className="flex flex-col gap-2 w-full max-w-md mb-6">
              {tasks.map((task: string, idx: number) => {
                const isSelected = selectedAlgoDecompositionAnswer.includes(task);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleAlgoDecompositionSelection(task)}
                    className={`py-3.5 px-4 border-4 rounded-2xl font-bold text-xs font-mono text-left transition-all shadow-sm flex items-center justify-between
                      ${isSelected 
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-md' 
                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'}`}
                  >
                    <span>{task}</span>
                    {isSelected && <span className="text-emerald-500 text-sm font-black">✓</span>}
                  </button>
                );
              })}
            </div>
            <button
              onClick={submitAlgoDecomposition}
              disabled={selectedAlgoDecompositionAnswer.length !== expected.length}
              className="py-3.5 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 border-4 border-indigo-700 text-white font-black rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify Sub-tasks
            </button>
          </div>
        );
      }

      case 'algo-bugs': {
        const steps = level.gameData.steps;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Logic Debugger Terminal
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm leading-relaxed">
              Find the logic error: click the command step that prevents compile execution:
            </p>
            <div className="flex flex-col gap-2.5 w-full max-w-md">
              {steps.map((step: string, idx: number) => {
                const isSelected = selectedAlgoBugsAnswer === step;
                const isCorrect = step === level.gameData.correctAnswer;
                return (
                  <button
                    key={idx}
                    disabled={selectedAlgoBugsAnswer !== null}
                    onClick={() => submitAlgoBugs(step)}
                    className={`py-3.5 px-4 border-4 rounded-2xl font-bold text-xs font-mono text-left transition-all shadow-sm
                      ${selectedAlgoBugsAnswer === null 
                        ? 'bg-slate-900 border-slate-800 text-slate-305 hover:border-slate-700 shadow-md' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 border-emerald-700 text-white shadow-md' 
                          : isSelected 
                            ? 'bg-rose-500 border-rose-700 text-white shadow-md animate-shake' 
                            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'}`}
                  >
                    {idx + 1}. {step}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'algo-math-bugs': {
        const steps = level.gameData.steps;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Maths Syntax Compiler
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm leading-relaxed">
              Find the arithmetic bug: click the command that contains the wrong math calculation:
            </p>
            <div className="flex flex-col gap-2.5 w-full max-w-md">
              {steps.map((step: string, idx: number) => {
                const isSelected = selectedAlgoMathBugsAnswer === step;
                const isCorrect = step === level.gameData.correctAnswer;
                return (
                  <button
                    key={idx}
                    disabled={selectedAlgoMathBugsAnswer !== null}
                    onClick={() => submitAlgoMathBugs(step)}
                    className={`py-3.5 px-4 border-4 rounded-2xl font-bold text-xs font-mono text-left transition-all shadow-sm
                      ${selectedAlgoMathBugsAnswer === null 
                        ? 'bg-slate-900 border-slate-800 text-slate-305 hover:border-slate-700 shadow-md' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 border-emerald-700 text-white shadow-md' 
                          : isSelected 
                            ? 'bg-rose-500 border-rose-700 text-white shadow-md animate-shake' 
                            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'}`}
                  >
                    {step}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'algo-logic-puzzles': {
        const text = level.gameData.text;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Logic Gate Deduction
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm leading-relaxed">
              {text}
            </p>
            <div className="text-4xl mb-8 animate-bounce animate-duration-2000">🤔</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: string) => {
                const isSelected = selectedAlgoLogicPuzzlesAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedAlgoLogicPuzzlesAnswer !== null}
                    onClick={() => submitAlgoLogicPuzzles(opt)}
                    className={`py-4 rounded-2xl font-black text-sm border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedAlgoLogicPuzzlesAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'algo-word-problems': {
        const text = level.gameData.text;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Requirements Modeler
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm leading-relaxed animate-pulse">
              Translate the requirement statement and calculate:
            </p>
            <div className="bg-indigo-50 border-2 border-indigo-100 rounded-3xl p-5 mb-8 w-full max-w-sm text-indigo-800 text-xs font-semibold leading-relaxed shadow-inner">
              {text}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedAlgoWordProblemsAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedAlgoWordProblemsAnswer !== null}
                    onClick={() => submitAlgoWordProblems(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedAlgoWordProblemsAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'algo-brain-teasers': {
        const seq = level.gameData.sequence;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Sequence Decryptor
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm leading-relaxed">
              Find the rule to calculate the missing pattern value:
            </p>
            <div className="flex gap-3 mb-8 items-center">
              {seq.map((s: number | string, idx: number) => (
                <span 
                  key={idx} 
                  className={`px-5 py-3 rounded-2xl text-2xl font-black shadow-inner border-2
                    ${s === '?' 
                      ? 'bg-yellow-50 border-yellow-300 text-yellow-605 animate-pulse scale-105' 
                      : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedAlgoBrainTeasersAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedAlgoBrainTeasersAnswer !== null}
                    onClick={() => submitAlgoBrainTeasers(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedAlgoBrainTeasersAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'algo-strategy': {
        const routes = level.gameData.routes;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Optimal Strategy Router
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm leading-relaxed">
              Select the safest route that ensures successful network packet delivery:
            </p>
            <div className="flex flex-col gap-3 w-full max-w-md mb-8">
              {routes.map((route: { name: string, steps: number, loss: number, description: string }, idx: number) => (
                <div key={idx} className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 text-left shadow-inner flex justify-between items-center font-mono">
                  <div>
                    <span className="font-bold text-indigo-400 text-sm">{route.name}</span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">{route.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-550 block">Loss Rate:</span>
                    <span className={`text-xs font-black ${route.loss === 0 ? 'text-emerald-400' : 'text-amber-500'}`}>{route.loss}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: string) => {
                const isSelected = selectedAlgoStrategyAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedAlgoStrategyAnswer !== null}
                    onClick={() => submitAlgoStrategy(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedAlgoStrategyAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'algo-flowchart': {
        const inputVal = level.gameData.input;
        const checkText = level.gameData.condition;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Flowchart Branching Logic
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm leading-relaxed">
              Trace the flowchart logic using input: **{inputVal}**:
            </p>
            <div className="flex flex-col items-center gap-1.5 mb-8 font-mono text-[10px] w-full max-w-xs">
              <div className="bg-sky-500 text-white border border-sky-400 px-4 py-1.5 rounded shadow">Start</div>
              <div className="w-0.5 h-3 bg-slate-400" />
              <div className="bg-amber-400 text-amber-900 border border-amber-300 px-4 py-2 rounded-full shadow font-bold text-center">
                Input: {inputVal}
              </div>
              <div className="w-0.5 h-3 bg-slate-400" />
              <div className="bg-purple-600 text-white border border-purple-500 px-5 py-3 rotate-45 flex items-center justify-center w-28 h-20 shadow text-center">
                <span className="-rotate-45 leading-tight font-bold">{checkText}</span>
              </div>
              <div className="flex justify-between w-32 px-1">
                <div className="flex flex-col items-center">
                  <span className="text-emerald-500 font-bold">Yes</span>
                  <div className="w-0.5 h-4 bg-slate-400" />
                  <div className="bg-emerald-500 text-white px-2 py-1 rounded shadow">Output: 1</div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-rose-500 font-bold">No</span>
                  <div className="w-0.5 h-4 bg-slate-400" />
                  <div className="bg-rose-500 text-white px-2 py-1 rounded shadow">Output: 0</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: number) => {
                const isSelected = selectedAlgoFlowchartAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedAlgoFlowchartAnswer !== null}
                    onClick={() => submitAlgoFlowchart(opt)}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedAlgoFlowchartAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    Output: {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'algo-design': {
        const text = level.gameData.goal;
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full w-full animate-fadeIn">
            <h4 className="text-xl font-bold text-slate-700 mb-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              Iterative Loop Designer
            </h4>
            <p className="text-slate-550 font-medium text-xs mb-6 text-center max-w-sm leading-relaxed">
              Design a loop helper block to achieve this goal:
            </p>
            <div className="bg-indigo-50 border-2 border-indigo-100 rounded-3xl p-5 mb-8 w-full max-w-sm text-indigo-850 text-xs font-semibold leading-relaxed shadow-inner">
              {text}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-sm">
              {level.gameData.options.map((opt: string) => {
                const isSelected = selectedAlgoDesignAnswer === opt;
                const isCorrect = opt === level.gameData.correctAnswer;
                return (
                  <button
                    key={opt}
                    disabled={selectedAlgoDesignAnswer !== null}
                    onClick={() => submitAlgoDesign(opt)}
                    className={`py-3 px-1 rounded-2xl font-black text-xs border-4 transition-all shadow-md transform hover:scale-105 active:scale-95
                      ${selectedAlgoDesignAnswer === null 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-700 text-white' 
                        : isSelected && isCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-700' 
                          : isSelected 
                            ? 'bg-rose-500 text-white border-rose-700 animate-shake' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      default:
        return <div>Invalid level type.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-pink-50 p-4 md:p-8 relative overflow-hidden">
      {/* Decorative kids-friendly background blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-pink-300/30 rounded-full blur-3xl pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl pointer-events-none animate-pulse duration-[10000ms]" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col gap-6 md:gap-8">
        {/* Back navigation & Part Selector */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 order-4 md:order-1">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-black flex items-center gap-2 text-sm bg-white/80 px-4 py-2 rounded-full border border-indigo-100 shadow-sm transition-all hover:scale-105">
            &larr; Back to Dashboard
          </Link>
          
          {/* Part Selector tabs */}
          <div className="flex gap-2 bg-white/60 backdrop-blur-md p-2 rounded-2xl border-2 border-indigo-100 max-w-full overflow-x-auto no-scrollbar shadow-sm">
            {STAGE1_NUMERACY_PARTS.map((p, idx) => {
              const isUnlocked = true;
              const isActive = idx === currentPartIndex;
              const activeBg = PART_COLORS[idx] || 'from-indigo-500 to-purple-600';
              return (
                <button
                  key={p.id}
                  onClick={() => selectPart(idx)}
                  disabled={!isUnlocked}
                  className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 transform hover:scale-102 active:scale-98
                    ${isActive 
                      ? `bg-gradient-to-r ${activeBg} text-white shadow-lg` 
                      : isUnlocked 
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'}`}
                >
                  {!isUnlocked && <Lock size={12} />}
                  {p.title.split(":")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Part HUD Info Banner */}
        <div className={`w-full bg-white rounded-[2rem] p-6 border-4 ${currentPartIndex === 0 ? 'border-pink-200' : currentPartIndex === 1 ? 'border-sky-200' : currentPartIndex === 2 ? 'border-indigo-200' : currentPartIndex === 3 ? 'border-emerald-200' : currentPartIndex === 4 ? 'border-amber-200' : currentPartIndex === 5 ? 'border-fuchsia-200' : currentPartIndex === 6 ? 'border-cyan-200' : 'border-rose-200'} flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md relative overflow-hidden order-5 md:order-2`}>
          <div>
            <span className="text-indigo-600 font-black text-xs uppercase tracking-widest block mb-1">{part.ageGroup}</span>
            <h2 className="text-2xl font-black text-slate-800">{part.title}</h2>
            <p className="text-slate-505 font-medium text-sm mt-1">{part.description}</p>
          </div>
          
          <div className="flex gap-2.5 bg-slate-105 p-2.5 rounded-2xl border border-slate-200 max-w-full overflow-x-auto no-scrollbar">
            {part.levels.map((lvm, idx) => {
              const globalLvl = currentPartIndex * 10 + idx;
              const isUnlocked = true;
              const isCurrent = idx === currentLevelIndex;
              return (
                <button
                  key={lvm.id}
                  onClick={() => {
                    if (isUnlocked) {
                      setCurrentLevelIndex(idx);
                    }
                  }}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all shadow-sm shrink-0 transform hover:scale-110 active:scale-90
                    ${isCurrent 
                      ? 'bg-gradient-to-r from-yellow-450 via-amber-400 to-yellow-500 text-slate-900 border-2 border-yellow-300 ring-4 ring-yellow-250 scale-105 shadow-md shadow-yellow-100' 
                      : isUnlocked 
                        ? 'bg-sky-100 hover:bg-sky-200 text-sky-600 border-2 border-sky-200' 
                        : 'bg-slate-200 text-slate-400 border border-slate-350 cursor-not-allowed opacity-50'}`}
                  disabled={!isUnlocked}
                  title={isUnlocked ? lvm.title : "Locked"}
                >
                  {isCurrent ? '⭐' : lvm.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Level Header HUD */}
        <div className="w-full bg-gradient-to-r from-pink-500 via-indigo-600 to-sky-500 rounded-[2.5rem] p-6 text-white shadow-xl border-4 border-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden order-2 md:order-3">
          <div className="absolute right-0 bottom-0 translate-y-1/3 translate-x-1/4 opacity-10 pointer-events-none">
            <Sparkles size={220} className="animate-spin duration-[20000ms]" />
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 border border-white/10">
              <Cpu size={12} /> Topic: {level.topic}
            </div>
            <h1 className="text-3xl font-black tracking-tight">{level.title}</h1>
            <p className="text-indigo-100 mt-2 font-medium max-w-2xl text-sm">{level.objective}</p>
          </div>
          <div className="shrink-0 flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 relative z-10">
            <Trophy className="text-yellow-300 drop-shadow-md animate-bounce animate-duration-1000" size={32} />
            <div>
              <span className="block text-[9px] font-black text-indigo-200 uppercase tracking-widest">Unlocked Ability</span>
              <span className="font-black text-sm text-white">{level.unlockedAbility}</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Side Description/Connection, Right Side Game */}
        <div className="w-full grid lg:grid-cols-12 gap-8 items-stretch order-1 md:order-4">
          
          {/* Left panel: Quest connection */}
          <div className="w-full lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
            <div className="bg-white rounded-[2rem] border-4 border-indigo-100 p-6 shadow-md flex-1 flex flex-col justify-between overflow-hidden">
              <div>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 -mx-6 -mt-6 p-6 rounded-t-[1.7rem] text-white flex items-center gap-3 mb-6 shadow-sm">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl animate-bounce">🤖</div>
                  <div>
                    <span className="block text-[9px] font-black text-indigo-200 uppercase tracking-widest">Co-pilot Bot</span>
                    <h3 className="font-black text-base leading-none">Rover's Mission Log</h3>
                  </div>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-slate-700 leading-relaxed font-semibold text-sm">
                  {level.codingLink}
                </div>
              </div>
              
              <div className="mt-8 bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex flex-col gap-3 shadow-inner">
                <div className="flex gap-3">
                  <Lightbulb className="text-amber-500 shrink-0" size={20} />
                  <div>
                    <span className="font-black text-xs text-amber-800 uppercase block mb-1">Rover hint</span>
                    <p className="text-xs text-amber-700/85 font-bold">Solve the quest on the right to compile the command register and boot the Rover to the next sector!</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="w-full mt-2 py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-black rounded-2xl shadow-lg shadow-orange-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border-b-4 border-orange-700"
                >
                  <HelpCircle size={16} className="animate-pulse" /> Stuck? Get Rover's Help!
                </button>
              </div>
            </div>
          </div>

          {/* Right panel: Interactive lab game */}
          <div className="w-full lg:col-span-8 order-1 lg:order-2">
            <div className={`w-full bg-white rounded-[2.5rem] border-[6px] ${success ? 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]' : success === false ? 'border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.25)]' : 'border-indigo-200 shadow-[0_0_25px_rgba(99,102,241,0.15)]'} p-4 sm:p-8 shadow-xl min-h-[460px] transition-all duration-300 ${shake ? 'animate-shake' : ''}`}>
              {renderGameArea()}
            </div>
          </div>

        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300 border-4 border-indigo-200">
            <div className="relative w-40 h-40 mb-6 flex items-center justify-center pointer-events-none">
              {/* Outer glowing pulsing circles */}
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping" />
              <div className="absolute inset-4 bg-yellow-400/30 rounded-full animate-pulse" />
              <div className="absolute inset-8 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.6)] flex items-center justify-center border-4 border-white">
                <Trophy size={56} className="text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] animate-bounce duration-1000" />
              </div>
            </div>
            
            <span className="text-indigo-600 text-xs font-black tracking-widest uppercase mb-1">Quest Completed!</span>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Level Complete!</h2>
            
            {pointsEarned > 0 && (
              <div className="flex gap-4 mb-4">
                <span className="flex items-center gap-1.5 bg-yellow-50 border-2 border-yellow-200 px-3 py-1 rounded-full text-yellow-700 font-black text-sm shadow-sm">
                  ⭐ +{pointsEarned} Stars
                </span>
                {streakCount > 0 && (
                  <span className="flex items-center gap-1.5 bg-orange-50 border-2 border-orange-200 px-3 py-1 rounded-full text-orange-700 font-black text-sm shadow-sm">
                    🔥 {streakCount} Day Streak
                  </span>
                )}
              </div>
            )}
            
            <p className="text-center text-slate-500 mb-6 text-sm max-w-xs font-medium">
              Excellent computing! You unlocked: <br/>
              <span className="font-bold text-indigo-600 text-base">{level.unlockedAbility}</span>
            </p>
            
            <div className="w-full flex gap-4 font-sans">
              <button 
                onClick={() => { setShowModal(false); resetLevelState(); }} 
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm"
              >
                Replay Level
              </button>
              
              {currentPartIndex * 10 + currentLevelIndex < 79 ? (
                <button 
                  onClick={handleNextLevel} 
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-md transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-sm"
                >
                  Next Level <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={handleNextLevel} 
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-md transition-all transform hover:scale-105 text-center flex items-center justify-center gap-2 text-sm"
                >
                  Go to Stage 2 <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Failure Modal */}
      {success === false && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center border-4 border-rose-200 animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-6 shadow-inner animate-bounce">
              <ShieldAlert size={48} className="stroke-[2.5]" />
            </div>
            
            <span className="text-rose-600 text-xs font-black tracking-widest uppercase mb-1">Quest Paused</span>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Try Again!</h2>
            
            <p className="text-center text-slate-500 mb-6 text-sm max-w-xs font-medium">
              Don't worry, coding is all about debugging and trying again. Let's patch the errors and rerun the compiler!
            </p>
            
            <button 
              onClick={() => { resetLevelState(); }} 
              className="w-full px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black rounded-2xl shadow-lg shadow-rose-100 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} /> Retry Level
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl flex flex-col border-4 border-amber-300 animate-in zoom-in duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
                <Brain size={28} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="text-amber-600 text-xs font-black tracking-widest uppercase block mb-0.5">Rover's Helper Bot</span>
                <h2 className="text-2xl font-black text-slate-800">{STAGE1_HELP_DATA[level.gameType]?.title || "Level Guide"}</h2>
              </div>
            </div>
            
            {/* Concept section */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6 relative z-10">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">Concept Blueprint</span>
              <p className="text-slate-700 font-bold text-sm leading-relaxed">
                {STAGE1_HELP_DATA[level.gameType]?.concept || "Learn how this computing block functions."}
              </p>
            </div>
            
            {/* Steps section */}
            <div className="mb-8 relative z-10 flex-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Step-by-step Execution</span>
              <ol className="space-y-4">
                {(STAGE1_HELP_DATA[level.gameType]?.steps || [
                  "Examine the challenge layout on the right side of the simulator screen.",
                  "Read instructions and options carefully.",
                  "Click your chosen response to execute code execution."
                ]).map((step, idx) => (
                  <li key={idx} className="flex gap-4 items-start">
                    <span className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 text-amber-700 text-xs font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-slate-600 text-sm font-semibold leading-relaxed pt-0.5">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
            
            <button 
              onClick={() => setShowHelpModal(false)} 
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-black rounded-2xl shadow-lg shadow-amber-100 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} /> Got It, Rover!
            </button>
          </div>
        </div>
      )}

      {/* Badge Celebration Modal */}
      {showBadgeCelebration && newlyUnlockedBadges.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300 border-4 border-yellow-400 relative overflow-hidden text-center">
            {/* Glimmer background */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-white to-orange-50 pointer-events-none" />
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-200/30 rounded-full blur-[60px]" />
            
            {/* Confetti & sparkles */}
            <div className="relative z-10 w-32 h-32 mb-6 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-full border-4 border-yellow-300 flex items-center justify-center shadow-xl animate-bounce">
              <span className="text-7xl">{newlyUnlockedBadges[0].icon}</span>
            </div>
            
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-black mb-3 border border-yellow-300 uppercase tracking-widest">
                🏆 Achievement Unlocked
              </span>
              
              <h2 className="text-3xl font-black text-slate-800 mb-2">
                {newlyUnlockedBadges[0].name}
              </h2>
              
              <p className="text-slate-600 font-bold mb-8 text-base px-4">
                {newlyUnlockedBadges[0].description}
              </p>
              
              <button 
                onClick={() => {
                  const remaining = newlyUnlockedBadges.slice(1);
                  setNewlyUnlockedBadges(remaining);
                  if (remaining.length === 0) {
                    setShowBadgeCelebration(false);
                  }
                }} 
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-black text-lg rounded-2xl shadow-lg shadow-yellow-100 transition-all active:scale-95"
              >
                {newlyUnlockedBadges.length > 1 ? "Next Badge! 🚀" : "Awesome! 🌟"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={showFeedbackModal} 
        stage={1} 
        part={currentPartIndex + 1} 
        onClose={handleFeedbackClose} 
      />

      {/* Lizzy AI Tutor Floating Chatbox */}
      <LizzyChat stage={1} level={currentLevelIndex + 1} />
    </div>
  );
}
