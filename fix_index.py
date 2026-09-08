import sys

with open('퀴즈1 전반부/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Inject scripts
head_target = """  <title>퀴즈 1 - 게이미피케이션</title>
  <link rel="preload" href="assets/font/PretendardVariable.woff2" as="font" type="font/woff2" crossorigin />"""
head_replacement = """  <title>퀴즈 1 - 게이미피케이션</title>
  <script src="../bgm.js"></script>
  <script src="../back_button.js"></script>
  <link rel="preload" href="assets/font/PretendardVariable.woff2" as="font" type="font/woff2" crossorigin />"""
content = content.replace(head_target, head_replacement)

# 2. Fix navigation
nav_target = """      } else if (scene === 2) {
        showQuestionScene();
        lockInput(INPUT_LOCK_MS);
        lockSceneTransition(QUESTION_TRANSITION_LOCK_MS);
      }
    }"""
nav_replacement = """      } else if (scene === 2) {
        showQuestionScene();
        lockInput(INPUT_LOCK_MS);
        lockSceneTransition(QUESTION_TRANSITION_LOCK_MS);
      } else if (scene === 3) {
        window.location.href = encodeURI('../퀴즈1/quiz_game_(4-7).html');
      }
    }"""
content = content.replace(nav_target, nav_replacement)

with open('퀴즈1 전반부/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement successful")
